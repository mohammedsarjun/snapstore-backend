// presentation/routes/auth.route.ts

import { Router } from "express";
import { AuthController } from "../controllers/auth-controller";
import { AuthUseCase } from "../../application/use-cases/AuthUseCase";
import { UserRepository } from "../../infrastructure/repositories/userRepository";

const router = Router();

// 🔥 Dependency Injection (composition root)
const userRepo = new UserRepository();
const authUseCase = new AuthUseCase(userRepo);
const authController = new AuthController(authUseCase);

router.post("/signup", authController.signup);

export default router;