import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { CreateUserDTO } from "../dtos/authDtos/create-user.dto";
import { User } from "../../domain/entities/User";
import bcrypt from "bcrypt";
import AppError from "../../shared/errors/AppError";
import { ERROR_MESSAGES } from "../../shared/constants/errorMessages";
import { HttpStatus } from "../../shared/constants/httpStatus";

export class AuthUseCase {
  constructor(private userRepo: IUserRepository) {}

  async signup(data: CreateUserDTO) {

    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new AppError(ERROR_MESSAGES.USER.USER_ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = new User(
      data.userName,
      data.email,
      data.phoneNumber,
      hashedPassword
    );

    user.validate();

    return await this.userRepo.create(user);
  }
}