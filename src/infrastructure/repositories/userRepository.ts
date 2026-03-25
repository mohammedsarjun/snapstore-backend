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

    async updateOtp(email: string, otp: string, otpExpiry: Date): Promise<void> {
        await UserModel.updateOne({ email }, { otp, otpExpiry });
    }

    async verifyUser(email: string): Promise<void> {
        await UserModel.updateOne({ email }, { isVerified: true, otp: null, otpExpiry: null });
    }

    async updateResetToken(email: string, resetToken: string, resetTokenExpiry: Date): Promise<void> {
        await UserModel.updateOne({ email }, { resetToken, resetTokenExpiry });
    }

    async findByResetToken(token: string): Promise<User | null> {
        const doc = await UserModel.findOne({ resetToken: token });
        if (!doc) return null;
        return UserMapper.toDomain(doc);
    }

    async updatePassword(email: string, hashedPassword: string): Promise<void> {
        await UserModel.updateOne({ email }, { password: hashedPassword });
    }

    async clearResetToken(email: string): Promise<void> {
        await UserModel.updateOne({ email }, { resetToken: null, resetTokenExpiry: null });
    }
}