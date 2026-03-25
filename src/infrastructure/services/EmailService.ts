import nodemailer, { Transporter } from "nodemailer";

export interface IEmailService {
  sendOtpEmail(email: string, otp: string): Promise<void>;
  sendResetLinkEmail(email: string, resetLink: string): Promise<void>;
}

export class EmailService implements IEmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: `"SnapStore" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "SnapStore - Email Verification OTP",
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #f7f4ee; border-radius: 8px;">
          <h1 style="font-family: 'Playfair Display', serif; color: #0f0e0d; font-size: 1.8rem; margin-bottom: 0.5rem;">SnapStore<span style="color: #c8502a;">.</span></h1>
          <p style="color: #8a8278; font-size: 0.95rem; margin-bottom: 1.5rem;">Verify your email address</p>
          <div style="background: #ffffff; border-radius: 4px; padding: 2rem; border: 1px solid #e8e0d0; text-align: center;">
            <p style="color: #0f0e0d; font-size: 1rem; margin-bottom: 1rem;">Your verification code is:</p>
            <div style="font-size: 2.5rem; font-weight: 700; letter-spacing: 8px; color: #0f0e0d; padding: 1rem; background: #f7f4ee; border-radius: 4px; display: inline-block;">${otp}</div>
            <p style="color: #8a8278; font-size: 0.85rem; margin-top: 1.5rem;">This code expires in <strong>5 minutes</strong>.</p>
          </div>
          <p style="color: #8a8278; font-size: 0.8rem; margin-top: 1.5rem; text-align: center;">If you didn't create a SnapStore account, please ignore this email.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendResetLinkEmail(email: string, resetLink: string): Promise<void> {
    const mailOptions = {
      from: `"SnapStore" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "SnapStore - Password Reset",
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background: #f7f4ee; border-radius: 8px;">
          <h1 style="font-family: 'Playfair Display', serif; color: #0f0e0d; font-size: 1.8rem; margin-bottom: 0.5rem;">SnapStore<span style="color: #c8502a;">.</span></h1>
          <p style="color: #8a8278; font-size: 0.95rem; margin-bottom: 1.5rem;">Password reset request</p>
          <div style="background: #ffffff; border-radius: 4px; padding: 2rem; border: 1px solid #e8e0d0; text-align: center;">
            <p style="color: #0f0e0d; font-size: 1rem; margin-bottom: 1.5rem;">Click the button below to reset your password:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 0.85rem 2rem; background: #0f0e0d; color: #f7f4ee; text-decoration: none; border-radius: 2px; font-weight: 500; font-size: 0.95rem;">Reset Password</a>
            <p style="color: #8a8278; font-size: 0.85rem; margin-top: 1.5rem;">This link expires in <strong>15 minutes</strong>.</p>
            <p style="color: #8a8278; font-size: 0.8rem; margin-top: 0.5rem;">If the button doesn't work, copy and paste this link:<br/><a href="${resetLink}" style="color: #2a6ec8; word-break: break-all;">${resetLink}</a></p>
          </div>
          <p style="color: #8a8278; font-size: 0.8rem; margin-top: 1.5rem; text-align: center;">If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
