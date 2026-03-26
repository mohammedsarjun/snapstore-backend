import type { Request, Response } from "express";
import { AuthUseCase } from "../../application/use-cases/AuthUseCase";
import { asyncHandler } from "../../shared/utils/AsyncWapper";
import { HttpStatus } from "../../shared/constants/httpStatus";
import { ApiResponse } from "../../shared/utils/ApiResponse";
import { API_RESPONSE_MESSAGES } from "../../shared/constants/ApiResponseMessage";
import {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth-validator";
import AppError from "../../shared/errors/AppError";
import { ERROR_MESSAGES } from "../../shared/constants/errorMessages";
import { AUTH_CONSTANTS } from "../../shared/constants/authConstants";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  maxAge: AUTH_CONSTANTS.COOKIE.MAX_AGE,
  path: AUTH_CONSTANTS.COOKIE.PATH,
};

export class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  signup = asyncHandler(async (req: Request, res: Response) => {
    req.body.phoneNumber = Number(req.body.phoneNumber);

    if (isNaN(req.body.phoneNumber)) {
      throw new AppError(ERROR_MESSAGES.USER.PHONE_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    const validation = signupSchema.safeParse(req.body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0].message;
      throw new AppError(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const result = await this.authUseCase.signup(validation.data);
    ApiResponse.success(
      res,
      HttpStatus.CREATED,
      API_RESPONSE_MESSAGES.USER.USER_CREATED_SUCCESSFULLY,
      result
    );
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0].message;
      throw new AppError(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const result = await this.authUseCase.login(validation.data);

    res.cookie(AUTH_CONSTANTS.COOKIE.NAME, result.token, COOKIE_OPTIONS);

    ApiResponse.success(
      res,
      HttpStatus.OK,
      API_RESPONSE_MESSAGES.USER.LOGIN_SUCCESSFUL,
      { user: result.user }
    );
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const validation = verifyOtpSchema.safeParse(req.body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0].message;
      throw new AppError(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const result = await this.authUseCase.verifyOtp(validation.data);

    res.cookie(AUTH_CONSTANTS.COOKIE.NAME, result.token, COOKIE_OPTIONS);

    ApiResponse.success(
      res,
      HttpStatus.OK,
      API_RESPONSE_MESSAGES.USER.OTP_VERIFIED,
      { user: result.user }
    );
  });

  resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const validation = resendOtpSchema.safeParse(req.body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0].message;
      throw new AppError(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const result = await this.authUseCase.resendOtp(validation.data);
    ApiResponse.success(
      res,
      HttpStatus.OK,
      API_RESPONSE_MESSAGES.USER.OTP_RESENT,
      result
    );
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const validation = forgotPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0].message;
      throw new AppError(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const result = await this.authUseCase.forgotPassword(validation.data);
    ApiResponse.success(
      res,
      HttpStatus.OK,
      API_RESPONSE_MESSAGES.USER.RESET_LINK_SENT,
      result
    );
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const validation = resetPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0].message;
      throw new AppError(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const result = await this.authUseCase.resetPassword(validation.data);
    ApiResponse.success(
      res,
      HttpStatus.OK,
      API_RESPONSE_MESSAGES.USER.PASSWORD_RESET_SUCCESS,
      result
    );
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.email) {
      throw new AppError(ERROR_MESSAGES.AUTH.TOKEN_MISSING, HttpStatus.UNAUTHORIZED);
    }
    const result = await this.authUseCase.getMe(req.user.email);
    ApiResponse.success(
      res,
      HttpStatus.OK,
      "User profile fetched",
      result
    );
  });

  logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie(AUTH_CONSTANTS.COOKIE.NAME, { path: AUTH_CONSTANTS.COOKIE.PATH });
    ApiResponse.success(res, HttpStatus.OK, "Logged out successfully", null);
  });
}
