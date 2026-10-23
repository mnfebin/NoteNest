import crypto from "crypto";
import path from "path";
import fs from "fs";
import { supabase, isSupabaseConfigured } from "../config/supabase.js";
import { env } from "../config/env.js";

const LOCAL_STORAGE_DIR = path.resolve(process.cwd(), "uploads");

// Ensure local directory exists if local storage fallback is used
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  try {
    fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
  } catch (e) {
    // ignore
  }
}

/**
 * Sanitizes original filename to prevent directory traversal and unsafe characters.
 */
function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export class StorageService {
  /**
   * Uploads a PDF file buffer to Supabase Storage.
   * If Supabase is not yet configured, returns a clear error or allows local fallback in tests.
   */
  static async uploadFile({ buffer, originalName, mimeType = "application/pdf" }) {
    const safeName = sanitizeFileName(originalName);
    const uniqueId = crypto.randomUUID();
    const timestamp = Date.now();
    const storagePath = `notes/${timestamp}-${uniqueId}-${safeName}`;

    // 1. Supabase configured
    if (isSupabaseConfigured()) {
      const bucket = env.SUPABASE_STORAGE_BUCKET || "notes";

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: false
        });

      if (error) {
        throw new Error(`Supabase Storage upload failed: ${error.message}`);
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);

      return {
        storagePath,
        fileUrl: urlData.publicUrl,
        storageProvider: "supabase"
      };
    }

    // 2. Fallback when credentials are not configured yet (e.g. initial setup / offline tests)
    if (process.env.ALLOW_LOCAL_STORAGE === "true" || env.NODE_ENV === "test") {
      const localFilePath = path.join(LOCAL_STORAGE_DIR, `${timestamp}-${uniqueId}-${safeName}`);
      fs.writeFileSync(localFilePath, buffer);
      return {
        storagePath: localFilePath,
        fileUrl: `/uploads/${path.basename(localFilePath)}`,
        storageProvider: "local"
      };
    }

    // 3. Supabase not configured and not in local fallback
    throw new Error(
      "Supabase Storage is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your backend/.env file, or set ALLOW_LOCAL_STORAGE=true for offline local testing."
    );
  }

  /**
   * Deletes a file from Supabase Storage or local fallback.
   */
  static async deleteFile(storagePath) {
    if (!storagePath) return;

    if (isSupabaseConfigured() && !path.isAbsolute(storagePath)) {
      const bucket = env.SUPABASE_STORAGE_BUCKET || "notes";
      await supabase.storage.from(bucket).remove([storagePath]);
      return;
    }

    if (fs.existsSync(storagePath)) {
      try {
        fs.unlinkSync(storagePath);
      } catch (err) {
        console.warn("Could not delete local file:", storagePath, err.message);
      }
    }
  }

  /**
   * Generates a direct or signed download URL.
   */
  static async getDownloadUrl(storagePath, expiresIn = 3600) {
    if (isSupabaseConfigured() && !path.isAbsolute(storagePath)) {
      const bucket = env.SUPABASE_STORAGE_BUCKET || "notes";
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(storagePath, expiresIn);

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
      return publicData?.publicUrl || null;
    }

    // Local file fallback
    if (path.isAbsolute(storagePath) && fs.existsSync(storagePath)) {
      return `/api/notes/file/${encodeURIComponent(path.basename(storagePath))}`;
    }

    return null;
  }
}
