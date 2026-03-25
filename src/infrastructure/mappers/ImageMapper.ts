import { Image } from "../../domain/entities/Image";
import { IImageModel } from "../database/image.model";

export class ImageMapper {
  static toPersistence(image: Image): Record<string, unknown> {
    return {
      userId: image.userId,
      title: image.title,
      imageUrl: image.imageUrl,
      order: image.order,
    };
  }

  static toDomain(doc: IImageModel): Image {
    return new Image(
      doc._id.toString(),
      doc.userId.toString(),
      doc.title,
      doc.imageUrl,
      doc.order,
      doc.createdAt as Date,
      doc.updatedAt as Date
    );
  }
}
