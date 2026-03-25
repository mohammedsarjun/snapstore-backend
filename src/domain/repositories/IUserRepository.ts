
import { User } from "../entities/User";

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  updateOtp(email: string, otp: string, otpExpiry: Date): Promise<void>;
  verifyUser(email: string): Promise<void>;
  updateResetToken(email: string, resetToken: string, resetTokenExpiry: Date): Promise<void>;
  findByResetToken(token: string): Promise<User | null>;
  updatePassword(email: string, hashedPassword: string): Promise<void>;
  clearResetToken(email: string): Promise<void>;
}