import type { Request, Response, NextFunction } from "express";
import { ITokenService, JwtPayload } from "../../infrastructure/services/TokenService";
import AppError from "../../shared/errors/AppError";
import { ERROR_MESSAGES } from "../../shared/constants/errorMessages";
import { HttpStatus } from "../../shared/constants/httpStatus";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export class AuthMiddleware {
  constructor(private tokenService: ITokenService) {}

  verify = (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      throw new AppError(ERROR_MESSAGES.AUTH.TOKEN_MISSING, HttpStatus.UNAUTHORIZED);
    }

    try {
      const decoded = this.tokenService.verifyToken(token);
      req.user = decoded;
      next();
    } catch {
      throw new AppError(ERROR_MESSAGES.AUTH.TOKEN_INVALID, HttpStatus.UNAUTHORIZED);
    }
  };
}
