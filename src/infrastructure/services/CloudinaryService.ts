import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

export interface ICloudinaryService {
  uploadImage(filePath: string): Promise<string>;
  deleteImage(publicId: string): Promise<void>;
}

export class CloudinaryService implements ICloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(filePath: string): Promise<string> {
    const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
      folder: "snapstore",
      resource_type: "image",
    });
    return result.secure_url;
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
