// presentation/routes/auth.route.ts

import { Router } from "express";
import { AuthController } from "../controllers/auth-controller";
import { AuthUseCase } from "../../application/use-cases/AuthUseCase";
import { UserRepository } from "../../infrastructure/repositories/userRepository";
import { TokenService } from "../../infrastructure/services/TokenService";

const router = Router();


const userRepo = new UserRepository();
const tokenService = new TokenService();
const authUseCase = new AuthUseCase(userRepo, tokenService);
const authController = new AuthController(authUseCase);

router.post("/signup", authController.signup);
router.post("/login", authController.login);

export default router;