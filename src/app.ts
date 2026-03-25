import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
// import adminRouter from "./routes/adminRouter";
import authRouter from "./presentation/routes/authRouter";
import imageRouter from "./presentation/routes/imageRouter";
import globalErrorHandler from "./infrastructure/middleware/globalErrorHandler";
import { connectDB } from './infrastructure/database/connectDb';

const app = express();
connectDB()
// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000", // your frontend URL
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/images", imageRouter);

// Global Error Handler
app.use(globalErrorHandler);

export default app;