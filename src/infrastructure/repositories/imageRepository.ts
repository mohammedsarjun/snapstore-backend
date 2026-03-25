import { IImageRepository } from "../../domain/repositories/IImageRepository";
import { Image } from "../../domain/entities/Image";
import { ImageModel, IImageModel } from "../database/image.model";
import { ImageMapper } from "../mappers/ImageMapper";

export class ImageRepository implements IImageRepository {
  async create(image: Image): Promise<Image> {
    const doc = await ImageModel.create(ImageMapper.toPersistence(image));
    return ImageMapper.toDomain(doc);
  }

  async createMany(images: Image[]): Promise<Image[]> {
    const persistenceData = images.map((img) => ImageMapper.toPersistence(img));
    const docs = await ImageModel.insertMany(persistenceData);
    return docs.map((doc) => ImageMapper.toDomain(doc as unknown as IImageModel));
  }

  async findByUserId(userId: string): Promise<Image[]> {
    const docs = await ImageModel.find({ userId }).sort({ order: 1 });
    return docs.map((doc) => ImageMapper.toDomain(doc));
  }

  async findById(id: string): Promise<Image | null> {
    const doc = await ImageModel.findById(id);
    if (!doc) return null;
    return ImageMapper.toDomain(doc);
  }

  async update(id: string, data: Partial<Pick<Image, "title" | "imageUrl">>): Promise<Image | null> {
    const doc = await ImageModel.findByIdAndUpdate(id, data, { new: true });
    if (!doc) return null;
    return ImageMapper.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await ImageModel.findByIdAndDelete(id);
  }

  async updateOrder(updates: { id: string; order: number }[]): Promise<void> {
    const bulkOps = updates.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));
    await ImageModel.bulkWrite(bulkOps);
  }
}
