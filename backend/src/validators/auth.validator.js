import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  semester: z.coerce.number().int().min(1).max(8).optional().default(4),
  branch: z.string().trim().optional().default("Computer Science & Engineering"),
  college: z.string().trim().optional().default("National Institute of Technology"),
  studentId: z.string().trim().optional()
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required")
});
