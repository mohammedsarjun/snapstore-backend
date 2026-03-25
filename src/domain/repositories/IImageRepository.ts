import { Image } from "../entities/Image";

export interface IImageRepository {
  create(image: Image): Promise<Image>;
  createMany(images: Image[]): Promise<Image[]>;
  findByUserId(userId: string): Promise<Image[]>;
  findById(id: string): Promise<Image | null>;
  update(id: string, data: Partial<Pick<Image, "title" | "imageUrl">>): Promise<Image | null>;
  delete(id: string): Promise<void>;
  updateOrder(updates: { id: string; order: number }[]): Promise<void>;
}
