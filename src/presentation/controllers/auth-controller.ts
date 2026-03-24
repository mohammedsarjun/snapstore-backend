import type { Request, Response } from "express";
import { AuthUseCase } from "../../application/use-cases/AuthUseCase";
import { asyncHandler } from "../../shared/utils/AsyncWapper";
import { HttpStatus } from "../../shared/constants/httpStatus";
import { ApiResponse } from "../../shared/utils/ApiResponse";
import { API_RESPONSE_MESSAGES } from "../../shared/constants/ApiResponseMessage";
import { signupSchema } from "../validators/auth-validator";
import AppError from "../../shared/errors/AppError";
import { ERROR_MESSAGES } from "../../shared/constants/errorMessages";

export class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  signup = asyncHandler(async (req: Request, res: Response) => {
    // Input validation

    req.body.phoneNumber = Number(req.body.phoneNumber);

    if(isNaN(req.body.phoneNumber)){
      throw new AppError(ERROR_MESSAGES.USER.PHONE_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    const validation = signupSchema.safeParse(req.body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0].message;
      console.log(errorMessage)
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
}

