import { IImageRepository } from "../../domain/repositories/IImageRepository";
import { ICloudinaryService } from "../../infrastructure/services/CloudinaryService";
import { Image } from "../../domain/entities/Image";
import { UploadImageDTO, UpdateImageDTO } from "../dtos/imageDtos/image.dto";
import AppError from "../../shared/errors/AppError";
import { ERROR_MESSAGES } from "../../shared/constants/errorMessages";
import { HttpStatus } from "../../shared/constants/httpStatus";
import fs from "fs";

export class ImageUseCase {
  constructor(
    private imageRepo: IImageRepository,
    private cloudinaryService: ICloudinaryService
  ) {}

  async uploadImages(userId: string, items: UploadImageDTO[]): Promise<Image[]> {
    const existing = await this.imageRepo.findByUserId(userId);
    let nextOrder = existing.length;

    const images: Image[] = [];

    for (const item of items) {
      const imageUrl = await this.cloudinaryService.uploadImage(item.file.path);
      fs.unlinkSync(item.file.path);

      const image = new Image("", userId, item.title.trim(), imageUrl, nextOrder);
      nextOrder++;
      images.push(image);
    }

    return await this.imageRepo.createMany(images);
  }

  async getUserImages(userId: string): Promise<Image[]> {
    return await this.imageRepo.findByUserId(userId);
  }

  async updateImage(imageId: string, userId: string, data: UpdateImageDTO): Promise<Image> {
    const image = await this.imageRepo.findById(imageId);
    if (!image) {
      throw new AppError(ERROR_MESSAGES.IMAGE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (image.userId !== userId) {
      throw new AppError(ERROR_MESSAGES.IMAGE.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const updateData: Partial<Pick<Image, "title" | "imageUrl">> = {};

    if (data.title) {
      updateData.title = data.title.trim();
    }

    if (data.file) {
      updateData.imageUrl = await this.cloudinaryService.uploadImage(data.file.path);
      fs.unlinkSync(data.file.path);
    }

    const updated = await this.imageRepo.update(imageId, updateData);
    if (!updated) {
      throw new AppError(ERROR_MESSAGES.IMAGE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return updated;
  }

  async deleteImage(imageId: string, userId: string): Promise<void> {
    const image = await this.imageRepo.findById(imageId);
    if (!image) {
      throw new AppError(ERROR_MESSAGES.IMAGE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (image.userId !== userId) {
      throw new AppError(ERROR_MESSAGES.IMAGE.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    await this.imageRepo.delete(imageId);
  }

  async reorderImages(userId: string, orderedIds: string[]): Promise<Image[]> {
    const userImages = await this.imageRepo.findByUserId(userId);
    const userImageIds = new Set(userImages.map((img) => img.id));

    for (const id of orderedIds) {
      if (!userImageIds.has(id)) {
        throw new AppError(ERROR_MESSAGES.IMAGE.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
      }
    }

    const updates = orderedIds.map((id, index) => ({ id, order: index }));
    await this.imageRepo.updateOrder(updates);

    return await this.imageRepo.findByUserId(userId);
  }
}
