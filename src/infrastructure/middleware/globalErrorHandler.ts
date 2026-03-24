import type { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../shared/constants/httpStatus";
import { ERROR_MESSAGES } from "../../shared/constants/errorMessages";
import { ZodError } from "zod";


const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Zod Error Handling
  if (err instanceof ZodError) {
    const message = err.issues.map((issue: any) => issue.message).join(", ");
    return res.status(HttpStatus.BAD_REQUEST).json({
      status: "fail",
      message: message,
    });
  }


  err.statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error("💥 ERROR:", err);

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: ERROR_MESSAGES.SERVER.SOMETHING_WENT_WRONG,
  });
};

export default globalErrorHandler;