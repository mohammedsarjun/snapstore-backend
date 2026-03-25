import mongoose, { Schema, Document } from "mongoose";

export interface IImageModel extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  imageUrl: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const imageSchema = new Schema<IImageModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

imageSchema.index({ userId: 1, order: 1 });

export const ImageModel = mongoose.model<IImageModel>("Image", imageSchema);
