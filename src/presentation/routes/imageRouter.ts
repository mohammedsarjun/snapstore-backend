import { Router } from "express";
import { ImageController } from "../controllers/image-controller";
import { ImageUseCase } from "../../application/use-cases/ImageUseCase";
import { ImageRepository } from "../../infrastructure/repositories/imageRepository";
import { CloudinaryService } from "../../infrastructure/services/CloudinaryService";
import { upload } from "../../config/multer";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { TokenService } from "../../infrastructure/services/TokenService";

const router = Router();

// Dependency Injection
const imageRepo = new ImageRepository();
const cloudinaryService = new CloudinaryService();
const imageUseCase = new ImageUseCase(imageRepo, cloudinaryService);
const imageController = new ImageController(imageUseCase);

const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);

// Apply auth middleware to all routes
router.use(authMiddleware.verify);

router.post("/upload", upload.array("images", 10), imageController.uploadImages);
router.get("/", imageController.getImages);
router.put("/:id", upload.single("image"), imageController.updateImage);
router.delete("/:id", imageController.deleteImage);
router.post("/reorder", imageController.reorderImages);

export default router;
