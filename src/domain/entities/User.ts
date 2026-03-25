import AppError from "../../shared/errors/AppError";
import { ERROR_MESSAGES } from "../../shared/constants/errorMessages";
import { HttpStatus } from "../../shared/constants/httpStatus";

export class User {
  public userName: string;
  public email: string;
  public phoneNumber: number;
  public password: string;

  constructor(
    userName: string,
    email: string,
    phoneNumber: number,
    password: string
  ) {
    // 🔥 Auto-clean here itself
    this.userName = userName.trim();
    this.email = email.trim().toLowerCase(); // normalize email
    this.phoneNumber = phoneNumber;
    this.password = password.trim();
  }

  validate() {
    // USERNAME
    if (!this.userName) {
      throw new AppError(ERROR_MESSAGES.USER.USERNAME_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    // EMAIL
    if (!this.email) {
      throw new AppError(
        ERROR_MESSAGES.USER.EMAIL_REQUIRED,
        HttpStatus.BAD_REQUEST
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.email)) {
      throw new AppError(
        ERROR_MESSAGES.USER.INVALID_EMAIL_FORMAT,
        HttpStatus.BAD_REQUEST
      );
    }

    // PASSWORD
    if (!this.password) {
      throw new AppError(ERROR_MESSAGES.USER.PASSWORD_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#/])[A-Za-z\d@$!%*?&#/]{8,}$/;


    if (!passwordRegex.test(this.password)) {
      throw new AppError(
        ERROR_MESSAGES.USER.PASSWORD_STRENGTH,
        HttpStatus.BAD_REQUEST
      );
    }

    // PHONE NUMBER
    if (typeof this.phoneNumber !== "number" || isNaN(this.phoneNumber)) {
      throw new AppError(ERROR_MESSAGES.USER.PHONE_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const phoneStr = this.phoneNumber.toString();

    if (phoneStr.length < 10 || phoneStr.length > 15) {
      throw new AppError(ERROR_MESSAGES.USER.PHONE_LENGTH, HttpStatus.BAD_REQUEST);
    }
  }
}