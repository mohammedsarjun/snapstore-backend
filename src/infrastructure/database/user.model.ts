import mongoose, { Schema, Document } from "mongoose";

// Interface
export interface IUserModel extends Document {
  userName: string;
  email: string;
  phoneNumber: number;
  password: string;
  isVerified: boolean;
  otp: string | null;
  otpExpiry: Date | null;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
}

// Schema
const userSchema = new Schema<IUserModel>(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: Number, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

// Model
export const UserModel = mongoose.model<IUserModel>("User", userSchema);