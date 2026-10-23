import app from "./app.js";
import { env } from "./config/env.js";
import prisma from "./config/prisma.js";
import { isSupabaseConfigured } from "./config/supabase.js";

const PORT = env.PORT || 5000;

async function startServer() {
  try {
    // Check PostgreSQL connection
    if (env.DATABASE_URL) {
      try {
        await prisma.$connect();
        console.log("✅ PostgreSQL database connected successfully via Prisma.");
      } catch (dbErr) {
        console.warn("⚠️ Warning: PostgreSQL connection failed:", dbErr.message);
        console.warn("👉 Ensure PostgreSQL is running and DATABASE_URL in backend/.env is correct.");
      }
    } else {
      console.warn("⚠️ DATABASE_URL not set in backend/.env.");
    }

    // Check Supabase Storage status
    if (isSupabaseConfigured()) {
      console.log(`✅ Supabase Storage configured (bucket: "${env.SUPABASE_STORAGE_BUCKET}").`);
    } else {
      console.log("ℹ️  Supabase Storage credentials not configured. PDF uploads will require SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY or local fallback.");
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 NoteNest Backend running in [${env.NODE_ENV}] mode on port ${PORT}`);
      console.log(`📡 Local API Base: http://localhost:${PORT}/api`);
      console.log(`🩺 Health check:   http://localhost:${PORT}/health`);
    });

    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log("🔒 Prisma database connection closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
