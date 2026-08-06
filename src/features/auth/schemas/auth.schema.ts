import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  remember_me: z.boolean().optional(),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

export const passwordRequirementsRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

export const setupPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(passwordRequirementsRegex.uppercase, "Must contain at least one uppercase letter")
      .regex(passwordRequirementsRegex.lowercase, "Must contain at least one lowercase letter")
      .regex(passwordRequirementsRegex.number, "Must contain at least one number")
      .regex(passwordRequirementsRegex.special, "Must contain at least one special character"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type SetupPasswordSchemaType = z.infer<typeof setupPasswordSchema>;
