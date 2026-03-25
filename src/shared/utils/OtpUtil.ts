import crypto from "crypto";

export class OtpUtil {
  static generate(length: number = 6): string {
    const digits = "0123456789";
    let otp = "";
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      otp += digits[bytes[i] % 10];
    }
    return otp;
  }

  static generateExpiry(minutes: number = 5): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  static isExpired(expiry: Date | null): boolean {
    if (!expiry) return true;
    return new Date() > new Date(expiry);
  }
}
