import multer from "multer";
import path from "path";
import { env } from "../config/env.js";
import { sendError } from "../utils/response.js";
import { isValidPdfBuffer } from "../utils/fileValidation.js";

// Store uploaded files in memory buffer for streaming to Supabase Storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isPdfMime = file.mimetype === "application/pdf";
  const isPdfExt = ext === ".pdf";

  if (isPdfMime && isPdfExt) {
    cb(null, true);
  } else {
    const error = new Error("Only PDF files (.pdf) are allowed for study notes.");
    error.code = "INVALID_FILE_TYPE";
    cb(error, false);
  }
};

const maxSizeBytes = (env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024;

const upload = multer({
  storage,
  limits: {
    fileSize: maxSizeBytes,
    files: 1
  },
  fileFilter
}).single("file");

/**
 * Express middleware wrapper to catch Multer errors, validate magic bytes, and format JSON responses.
 */
export function uploadPdf(req, res, next) {
  upload(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return sendError(res, {
          statusCode: 413,
          message: `File size exceeds the limit of ${env.MAX_FILE_SIZE_MB} MB.`
        });
      }
      if (err.code === "INVALID_FILE_TYPE") {
        return sendError(res, {
          statusCode: 400,
          message: err.message
        });
      }
      return sendError(res, {
        statusCode: 400,
        message: err.message || "File upload failed."
      });
    }

    // Server-side PDF binary content verification (Magic bytes check)
    if (req.file) {
      if (!isValidPdfBuffer(req.file.buffer)) {
        return sendError(res, {
          statusCode: 400,
          message: "Invalid file content: The uploaded file is not a valid PDF document (magic bytes signature verification failed)."
        });
      }
    }

    next();
  });
}

