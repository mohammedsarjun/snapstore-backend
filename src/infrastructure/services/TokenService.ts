import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  email: string;
  userName: string;
}

export interface ITokenService {
  generateToken(payload: JwtPayload): string;
  verifyToken(token: string): JwtPayload;
}

export class TokenService implements ITokenService {
  private readonly secret: string;
  private readonly expiresIn: number;

  constructor() {
    this.secret = process.env.JWT_SECRET || "snapstore_default_secret";
    this.expiresIn = Number(process.env.JWT_EXPIRES_IN) || 604800;
  }

  generateToken(payload: JwtPayload): string {
    const options: jwt.SignOptions = { expiresIn: this.expiresIn };
    return jwt.sign(payload, this.secret, options);
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }
}
