import { z } from "zod";
import { ERROR_MESSAGES } from "../../shared/constants/errorMessages";

export const signupSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.USER.USERNAME_REQUIRED),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, ERROR_MESSAGES.USER.EMAIL_REQUIRED)
    .email(ERROR_MESSAGES.USER.INVALID_EMAIL_FORMAT),
  phoneNumber: z
    .number()
    .refine((val) => val.toString().length >= 10 && val.toString().length <= 15, {
      message: ERROR_MESSAGES.USER.PHONE_LENGTH,
    }),
  password: z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.USER.PASSWORD_REQUIRED)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#/])[A-Za-z\d@$!%*?&#/]{8,}$/, ERROR_MESSAGES.USER.PASSWORD_STRENGTH),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, ERROR_MESSAGES.USER.EMAIL_REQUIRED)
    .email(ERROR_MESSAGES.USER.INVALID_EMAIL_FORMAT),
  password: z
    .string()
    .trim()
    .min(1, ERROR_MESSAGES.USER.PASSWORD_REQUIRED),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

