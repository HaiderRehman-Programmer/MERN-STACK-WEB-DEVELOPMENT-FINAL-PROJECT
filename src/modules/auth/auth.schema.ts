import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email structure").toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters").refine((val) => /[A-Z]/.test(val) && /[0-9]/.test(val), {
      message: "Password must contain at least one uppercase letter and one number",
    }),
  }).strict()
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email structure").toLowerCase(),
    password: z.string().min(1, "Password is required"),
  }).strict()
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email structure").toLowerCase(),
  }).strict()
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(8, "Password must be at least 8 characters").refine((val) => /[A-Z]/.test(val) && /[0-9]/.test(val), {
      message: "Password must contain at least one uppercase letter and one number",
    }),
  }).strict()
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters").optional(),
    lastName: z.string().min(2, "Last name must be at least 2 characters").optional(),
  }).strict()
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters").refine((val) => /[A-Z]/.test(val) && /[0-9]/.test(val), {
      message: "Password must contain at least one uppercase letter and one number",
    }),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  }).strict().refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
});
