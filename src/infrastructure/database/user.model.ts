import mongoose, { Schema, Document } from "mongoose";

// Interface
export interface IUserModel extends Document {
  userName: string;
  email: string;
  phoneNumber: number;
  password: string;
}

// Schema
const userSchema = new Schema<IUserModel>(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: Number, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Model
export const UserModel = mongoose.model<IUserModel>("User", userSchema);