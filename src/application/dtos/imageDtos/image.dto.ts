export interface UploadImageDTO {
  title: string;
  file: Express.Multer.File;
}

export interface BulkUploadDTO {
  items: UploadImageDTO[];
}

export interface UpdateImageDTO {
  title?: string;
  file?: Express.Multer.File;
}

export interface ReorderDTO {
  orderedIds: string[];
}
