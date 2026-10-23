import crypto from "crypto";
import path from "path";
import fs from "fs";
import { supabase, isSupabaseConfigured } from "../config/supabase.js";
import { env } from "../config/env.js";
import { sanitizeFileName } from "../utils/fileValidation.js";

const LOCAL_STORAGE_DIR = path.resolve(process.cwd(), "uploads");

// Ensure local directory exists for test / offline fallback mode
if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
  try {
    fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
  } catch (e) {
    // Ignore directory creation error
  }
}

/**
 * Extracts a storage key from a Supabase public URL or relative path.
 *
 * @param {string} identifier - Full public URL or relative storage key
 * @returns {string} Relative storage key (e.g. "notes/1740000000-uuid-file.pdf")
 */
function extractStorageKey(identifier) {
  if (!identifier) return "";
  if (path.isAbsolute(identifier)) return identifier;

  // If it's a full Supabase URL, extract the path after the bucket name
  const bucket = env.SUPABASE_STORAGE_BUCKET || "notenest-notes";
  const marker = `/${bucket}/`;
  if (identifier.includes(marker)) {
    return identifier.split(marker)[1];
  }

  // Already a clean relative key (e.g. "notes/...")
  return identifier;
}

export class StorageService {
  /**
   * Uploads a PDF file buffer to Supabase Storage.
   * Generates a collision-free, server-controlled unique file key.
   *
   * @param {Object} params
   * @param {Buffer} params.buffer - PDF binary buffer
   * @param {string} params.originalName - Uploaded filename
   * @param {string} params.mimeType - MIME type (defaults to application/pdf)
   * @returns {Promise<{ fileKey: string, storagePath: string, fileUrl: string, storageProvider: string }>}
   */
  static async uploadFile({ buffer, originalName, mimeType = "application/pdf" }) {
    const safeName = sanitizeFileName(originalName);
    const uniqueId = crypto.randomUUID();
    const timestamp = Date.now();
    const fileKey = `notes/${timestamp}-${uniqueId}-${safeName}`;

    // 1. Production / Cloud Mode: Supabase Storage
    if (isSupabaseConfigured()) {
      const bucket = env.SUPABASE_STORAGE_BUCKET || "notenest-notes";

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileKey, buffer, {
          contentType: mimeType,
          upsert: false
        });

      if (error) {
        throw new Error(`Supabase Storage upload failed: ${error.message}`);
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileKey);

      return {
        fileKey,
        storagePath: fileKey,
        fileUrl: urlData.publicUrl,
        storageProvider: "supabase"
      };
    }

    // 2. Fallback Mode: Offline tests or local development without cloud keys
    if (process.env.ALLOW_LOCAL_STORAGE === "true" || env.NODE_ENV === "test") {
      const localFilePath = path.join(LOCAL_STORAGE_DIR, `${timestamp}-${uniqueId}-${safeName}`);
      fs.writeFileSync(localFilePath, buffer);
      return {
        fileKey: localFilePath,
        storagePath: localFilePath,
        fileUrl: `/uploads/${path.basename(localFilePath)}`,
        storageProvider: "local"
      };
    }

    // 3. Supabase not configured and local fallback disabled
    throw new Error(
      "Supabase Storage is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your backend/.env file, or set ALLOW_LOCAL_STORAGE=true for offline local development."
    );
  }

  /**
   * Generates a short-lived signed download URL (default expiration: 60 seconds).
   *
   * @param {string} fileKeyOrUrl - File key or URL stored in database
   * @param {number} expiresIn - Expiration in seconds (default: 60s per security spec)
   * @returns {Promise<string|null>} Signed URL or null if unavailable
   */
  static async getDownloadUrl(fileKeyOrUrl, expiresIn = 60) {
    if (!fileKeyOrUrl) return null;

    // Handle Supabase Storage
    if (isSupabaseConfigured() && !path.isAbsolute(fileKeyOrUrl)) {
      const bucket = env.SUPABASE_STORAGE_BUCKET || "notenest-notes";
      const key = extractStorageKey(fileKeyOrUrl);

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(key, expiresIn);

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }

      // Fallback to public URL if signed URL creation fails
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(key);
      return publicData?.publicUrl || null;
    }

    // Local file fallback
    if (path.isAbsolute(fileKeyOrUrl) && fs.existsSync(fileKeyOrUrl)) {
      return `/api/notes/file/${encodeURIComponent(path.basename(fileKeyOrUrl))}`;
    }

    return null;
  }

  /**
   * Deletes a file from Supabase Storage or local directory safely.
   *
   * @param {string} fileKeyOrUrl - Storage key or URL
   */
  static async deleteFile(fileKeyOrUrl) {
    if (!fileKeyOrUrl) return;

    if (isSupabaseConfigured() && !path.isAbsolute(fileKeyOrUrl)) {
      const bucket = env.SUPABASE_STORAGE_BUCKET || "notenest-notes";
      const key = extractStorageKey(fileKeyOrUrl);
      try {
        await supabase.storage.from(bucket).remove([key]);
      } catch (err) {
        console.warn("Storage deletion warning:", err.message);
      }
      return;
    }

    if (fs.existsSync(fileKeyOrUrl)) {
      try {
        fs.unlinkSync(fileKeyOrUrl);
      } catch (err) {
        console.warn("Could not delete local file:", fileKeyOrUrl, err.message);
      }
    }
  }
}

export default StorageService;
