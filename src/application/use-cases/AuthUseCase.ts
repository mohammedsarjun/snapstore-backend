import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { CreateUserDTO } from "../dtos/authDtos/create-user.dto";
import { LoginUserDTO } from "../dtos/authDtos/login-user.dto";
import { User } from "../../domain/entities/User";
import bcrypt from "bcrypt";
import AppError from "../../shared/errors/AppError";
import { ERROR_MESSAGES } from "../../shared/constants/errorMessages";
import { HttpStatus } from "../../shared/constants/httpStatus";
import { ITokenService } from "../../infrastructure/services/TokenService";

export class AuthUseCase {
  constructor(
    private userRepo: IUserRepository,
    private tokenService: ITokenService
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


    return await this.userRepo.create(user);
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

    // 3. Generate JWT token
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
}