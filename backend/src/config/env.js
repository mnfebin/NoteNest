import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters long"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  SUPABASE_URL: z.string().optional().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  SUPABASE_STORAGE_BUCKET: z.string().default("notes"),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  // In development, if DATABASE_URL or JWT_SECRET is missing, explain clearly
  if (!process.env.DATABASE_URL) {
    console.error("👉 Please set DATABASE_URL in backend/.env");
  }
  if (!process.env.JWT_SECRET) {
    console.error("👉 Please set JWT_SECRET in backend/.env");
  }
}

export const env = parsed.success ? parsed.data : {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "default_dev_secret_key_notenest_college_2026",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET || "notes",
  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB) || 10
};
