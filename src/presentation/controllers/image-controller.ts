import type { Request, Response } from "express";
import { ImageUseCase } from "../../application/use-cases/ImageUseCase";
import { asyncHandler } from "../../shared/utils/AsyncWapper";
import { HttpStatus } from "../../shared/constants/httpStatus";
import { ApiResponse } from "../../shared/utils/ApiResponse";
import { API_RESPONSE_MESSAGES } from "../../shared/constants/ApiResponseMessage";
import AppError from "../../shared/errors/AppError";
import { ERROR_MESSAGES } from "../../shared/constants/errorMessages";
import { UploadImageDTO, UpdateImageDTO } from "../../application/dtos/imageDtos/image.dto";
import { reorderSchema } from "../validators/image-validator";
import fs from "fs";

export class ImageController {
  constructor(private imageUseCase: ImageUseCase) {}

  uploadImages = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new AppError(ERROR_MESSAGES.AUTH.TOKEN_MISSING, HttpStatus.UNAUTHORIZED);
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new AppError(ERROR_MESSAGES.IMAGE.FILE_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const { titles } = req.body;
    let titleArray: string[] = [];
    
    if (typeof titles === "string") {
      try {
        titleArray = JSON.parse(titles);
      } catch {
        titleArray = [titles];
      }
    } else if (Array.isArray(titles)) {
      titleArray = titles;
    }

    if (titleArray.length !== files.length) {
      for (const file of files) {
        fs.unlinkSync(file.path);
      }
      throw new AppError(ERROR_MESSAGES.IMAGE.TITLE_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const items: UploadImageDTO[] = files.map((file, index) => ({
      title: titleArray[index],
      file,
    }));

    const result = await this.imageUseCase.uploadImages(req.user.id, items);
    
    ApiResponse.success(
      res,
      HttpStatus.CREATED,
      API_RESPONSE_MESSAGES.IMAGE.UPLOADED,
      result
    );
  });

  getImages = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new AppError(ERROR_MESSAGES.AUTH.TOKEN_MISSING, HttpStatus.UNAUTHORIZED);
    }

    const result = await this.imageUseCase.getUserImages(req.user.id);
    
    ApiResponse.success(
      res,
      HttpStatus.OK,
      API_RESPONSE_MESSAGES.IMAGE.FETCHED,
      result
    );
  });

  updateImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new AppError(ERROR_MESSAGES.AUTH.TOKEN_MISSING, HttpStatus.UNAUTHORIZED);
    }

    const id = req.params.id as string;
    const { title } = req.body;
    const file = req.file;

    const data: UpdateImageDTO = {};
    if (title) data.title = Array.isArray(title) ? title[0] : (title as string);
    if (file) data.file = file;

    const result = await this.imageUseCase.updateImage(id, req.user.id, data);
    
    ApiResponse.success(
      res,
      HttpStatus.OK,
      API_RESPONSE_MESSAGES.IMAGE.UPDATED,
      result
    );
  });

  deleteImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new AppError(ERROR_MESSAGES.AUTH.TOKEN_MISSING, HttpStatus.UNAUTHORIZED);
    }

    const id = req.params.id as string;

    await this.imageUseCase.deleteImage(id, req.user.id);
    
    ApiResponse.success(
      res,
      HttpStatus.OK,
      API_RESPONSE_MESSAGES.IMAGE.DELETED,
      null
    );
  });

  reorderImages = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
      throw new AppError(ERROR_MESSAGES.AUTH.TOKEN_MISSING, HttpStatus.UNAUTHORIZED);
    }

    const validation = reorderSchema.safeParse(req.body);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0].message;
      throw new AppError(errorMessage, HttpStatus.BAD_REQUEST);
    }

    const result = await this.imageUseCase.reorderImages(req.user.id, validation.data.orderedIds);
    
    ApiResponse.success(
      res,
      HttpStatus.OK,
      API_RESPONSE_MESSAGES.IMAGE.REORDERED,
      result
    );
  });
}
