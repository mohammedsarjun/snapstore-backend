
import { User } from "../../domain/entities/User";
import { IUserModel } from "../database/user.model";

export class UserMapper {
  static toPersistence(user: User) {
    return {
      userName: user.userName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      password: user.password,
    };
  }

  static toDomain(doc: IUserModel): User {
    return new User(
      doc.userName,
      doc.email,
      doc.phoneNumber,
      doc.password
    );
  }
}

