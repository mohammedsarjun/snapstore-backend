import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { CreateUserDTO } from "../dtos/authDtos/create-user.dto";
import { LoginUserDTO } from "../dtos/authDtos/login-user.dto";
import { VerifyOtpDTO } from "../dtos/authDtos/verify-otp.dto";
import { ResendOtpDTO } from "../dtos/authDtos/resend-otp.dto";
import { ForgotPasswordDTO } from "../dtos/authDtos/forgot-password.dto";
import { ResetPasswordDTO } from "../dtos/authDtos/reset-password.dto";
import { User } from "../../domain/entities/User";
import bcrypt from "bcrypt";
import crypto from "crypto";
import AppError from "../../shared/errors/AppError";
import { ERROR_MESSAGES } from "../../shared/constants/errorMessages";
import { HttpStatus } from "../../shared/constants/httpStatus";
import { ITokenService } from "../../infrastructure/services/TokenService";
import { IEmailService } from "../../infrastructure/services/EmailService";
import { OtpUtil } from "../../shared/utils/OtpUtil";

export class AuthUseCase {
  constructor(
    private userRepo: IUserRepository,
    private tokenService: ITokenService,
    private emailService: IEmailService
  ) {}

  async signup(data: CreateUserDTO) {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new AppError(ERROR_MESSAGES.USER.USER_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    // 1. Create user with plain password for validation
    const user = new User(
      data.userName,
      data.email,
      data.phoneNumber,
      data.password
    );

    // 2. Validate user (matches original plain password rules)
    user.validate();

    // 3. Hash the password ONLY after successful validation
    user.password = await bcrypt.hash(data.password, 10);

    // 4. Generate OTP and set expiry
    const otp = OtpUtil.generate();
    const otpExpiry = OtpUtil.generateExpiry(5); // 5 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.isVerified = false;

    // 5. Create user in DB
    const createdUser = await this.userRepo.create(user);

    // 6. Send OTP email
    await this.emailService.sendOtpEmail(createdUser.email, otp);

    return {
      email: createdUser.email,
      userName: createdUser.userName,
    };
  }

  async login(data: LoginUserDTO) {
    // 1. Find user by email
    const user = await this.userRepo.findByEmail(data.email.trim().toLowerCase());
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.USER.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
    }

    // 3. Check if user is verified
    if (!user.isVerified) {
      // Generate new OTP and send for unverified users
      const otp = OtpUtil.generate();
      const otpExpiry = OtpUtil.generateExpiry(5);
      await this.userRepo.updateOtp(user.email, otp, otpExpiry);
      await this.emailService.sendOtpEmail(user.email, otp);

      throw new AppError(ERROR_MESSAGES.USER.USER_NOT_VERIFIED, HttpStatus.UNAUTHORIZED);
    }

    // 4. Generate JWT token
    const token = this.tokenService.generateToken({
      email: user.email,
      userName: user.userName,
    });

    return {
      token,
      user: {
        userName: user.userName,
        email: user.email,
      },
    };
  }

  async verifyOtp(data: VerifyOtpDTO) {
    // 1. Find user by email
    const user = await this.userRepo.findByEmail(data.email.trim().toLowerCase());
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // 2. Check if already verified
    if (user.isVerified) {
      throw new AppError(ERROR_MESSAGES.USER.USER_ALREADY_VERIFIED, HttpStatus.BAD_REQUEST);
    }

    // 3. Validate OTP
    if (user.otp !== data.otp) {
      throw new AppError(ERROR_MESSAGES.USER.INVALID_OTP, HttpStatus.BAD_REQUEST);
    }

    // 4. Check OTP expiry
    if (OtpUtil.isExpired(user.otpExpiry)) {
      throw new AppError(ERROR_MESSAGES.USER.OTP_EXPIRED, HttpStatus.BAD_REQUEST);
    }

    // 5. Mark user as verified
    await this.userRepo.verifyUser(user.email);

    // 6. Generate JWT token so user can proceed to home
    const token = this.tokenService.generateToken({
      email: user.email,
      userName: user.userName,
    });

    return {
      token,
      user: {
        userName: user.userName,
        email: user.email,
      },
    };
  }

  async resendOtp(data: ResendOtpDTO) {
    // 1. Find user by email
    const user = await this.userRepo.findByEmail(data.email.trim().toLowerCase());
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // 2. Check if already verified
    if (user.isVerified) {
      throw new AppError(ERROR_MESSAGES.USER.USER_ALREADY_VERIFIED, HttpStatus.BAD_REQUEST);
    }

    // 3. Generate new OTP
    const otp = OtpUtil.generate();
    const otpExpiry = OtpUtil.generateExpiry(5);

    // 4. Update OTP in DB
    await this.userRepo.updateOtp(user.email, otp, otpExpiry);

    // 5. Send OTP email
    await this.emailService.sendOtpEmail(user.email, otp);

    return { email: user.email };
  }

  async forgotPassword(data: ForgotPasswordDTO) {
    // 1. Find user by email
    const user = await this.userRepo.findByEmail(data.email.trim().toLowerCase());
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // 2. Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // 3. Save reset token in DB
    await this.userRepo.updateResetToken(user.email, resetToken, resetTokenExpiry);

    // 4. Build reset link
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/change-password?token=${resetToken}`;

    // 5. Send reset link email
    await this.emailService.sendResetLinkEmail(user.email, resetLink);

    return { email: user.email };
  }

  async resetPassword(data: ResetPasswordDTO) {
    // 1. Validate passwords match
    if (data.password !== data.confirmPassword) {
      throw new AppError(ERROR_MESSAGES.USER.PASSWORDS_DO_NOT_MATCH, HttpStatus.BAD_REQUEST);
    }

    // 2. Find user by reset token
    const user = await this.userRepo.findByResetToken(data.token);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER.INVALID_RESET_TOKEN, HttpStatus.BAD_REQUEST);
    }

    // 3. Check token expiry
    if (!user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
      throw new AppError(ERROR_MESSAGES.USER.RESET_TOKEN_EXPIRED, HttpStatus.BAD_REQUEST);
    }

    // 4. Hash new password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 5. Update password
    await this.userRepo.updatePassword(user.email, hashedPassword);

    // 6. Clear reset token
    await this.userRepo.clearResetToken(user.email);

    return { email: user.email };
  }
}