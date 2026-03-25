import { Resend } from "resend";

export interface IEmailService {
  sendOtpEmail(email: string, otp: string): Promise<void>;
  sendResetLinkEmail(email: string, resetLink: string): Promise<void>;
}

export class EmailService implements IEmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: "SnapStore <support@snapstore.dev>", 
        to: email,
        subject: "SnapStore - Email Verification OTP",
        html: `
          <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #f7f4ee; border-radius: 8px;">
            <h1 style="font-family: 'Playfair Display', serif; color: #0f0e0d;">SnapStore<span style="color: #c8502a;">.</span></h1>
            <p>Verify your email address</p>
            <div style="background: #ffffff; padding: 2rem; text-align: center;">
              <p>Your OTP:</p>
              <h2 style="letter-spacing: 6px;">${otp}</h2>
              <p>This expires in 5 minutes</p>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error("❌ Email send error:", error);
      throw new Error("Failed to send OTP email");
    }
  }

  async sendResetLinkEmail(email: string, resetLink: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: "SnapStore <onboarding@resend.dev>",
        to: email,
        subject: "SnapStore - Password Reset",
        html: `
          <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #f7f4ee; border-radius: 8px;">
            <h1 style="font-family: 'Playfair Display', serif; color: #0f0e0d;">SnapStore<span style="color: #c8502a;">.</span></h1>
            <p>Password reset request</p>
            <div style="background: #ffffff; padding: 2rem; text-align: center;">
              <p>Click below to reset your password:</p>
              <a href="${resetLink}" style="padding: 10px 20px; background: black; color: white; text-decoration: none;">Reset Password</a>
            </div>
          </div>
        `,
      });
    } catch (error) {
      console.error("❌ Email send error:", error);
      throw new Error("Failed to send reset email");
    }
  }
}