import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { UserModel } from "../database/user.model";
import { UserMapper } from "../mappers/UserMapper";


export class UserRepository implements IUserRepository {
    async create(user: User): Promise<User> {
        const doc = await UserModel.create(UserMapper.toPersistence(user));
        return UserMapper.toDomain(doc);
    }

    async findByEmail(email: string): Promise<User | null> {
        const doc = await UserModel.findOne({ email });
        if (!doc) return null;
        return UserMapper.toDomain(doc);
    }
}