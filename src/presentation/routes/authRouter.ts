// presentation/routes/auth.route.ts

import { Router } from "express";
import { AuthController } from "../controllers/auth-controller";
import { AuthUseCase } from "../../application/use-cases/AuthUseCase";
import { UserRepository } from "../../infrastructure/repositories/userRepository";
import { TokenService } from "../../infrastructure/services/TokenService";
import { EmailService } from "../../infrastructure/services/EmailService";

const router = Router();

// Dependency Injection
const userRepo = new UserRepository();
const tokenService = new TokenService();
const emailService = new EmailService();
const authUseCase = new AuthUseCase(userRepo, tokenService, emailService);
const authController = new AuthController(authUseCase);

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOtp);
router.post("/resend-otp", authController.resendOtp);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authController.logout);

export default router;