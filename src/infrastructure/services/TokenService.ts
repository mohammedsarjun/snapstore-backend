import jwt, { SignOptions } from "jsonwebtoken";

export interface ITokenService {
  generateToken(payload: object): string;
}

export class TokenService implements ITokenService {
  private readonly secret: string;
  private readonly expiresIn: number;

  constructor() {
    this.secret = process.env.JWT_SECRET || "snapstore_default_secret";
    this.expiresIn = Number(process.env.JWT_EXPIRES_IN) || 604800; // 7 days in seconds
  }

  generateToken(payload: object): string {
    const options: SignOptions = { expiresIn: this.expiresIn };
    return jwt.sign(payload, this.secret, options);
  }
}
