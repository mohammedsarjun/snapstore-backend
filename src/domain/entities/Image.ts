export class Image {
  public id: string;
  public userId: string;
  public title: string;
  public imageUrl: string;
  public order: number;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    title: string,
    imageUrl: string,
    order: number,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.imageUrl = imageUrl;
    this.order = order;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
