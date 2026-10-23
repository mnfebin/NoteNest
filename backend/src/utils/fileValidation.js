/**
 * Server-side file validation utilities for PDF lecture notes.
 * Enforces security without relying solely on client-provided MIME types or file extensions.
 */

/**
 * Validates that a buffer starts with the canonical PDF header signature (Magic Bytes: %PDF).
 * Standard PDF files must start with hexadecimal bytes: 25 50 44 46 ('%PDF').
 *
 * @param {Buffer} buffer - File buffer from Multer memory storage
 * @returns {boolean} True if buffer contains a valid PDF header
 */
export function isValidPdfBuffer(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 5) {
    return false;
  }

  // Canonical PDF magic bytes check:
  // 0x25 = %, 0x50 = P, 0x44 = D, 0x46 = F
  const isMagicMatch =
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46;

  return isMagicMatch;
}

/**
 * Sanitizes original filename to prevent directory traversal and unsafe filesystem characters.
 *
 * @param {string} fileName - Original uploaded filename
 * @returns {string} Sanitized filename safe for storage and download headers
 */
export function sanitizeFileName(fileName) {
  if (!fileName || typeof fileName !== "string") {
    return "lecture_note.pdf";
  }

  // Extract basename to prevent path traversal (../ or ..\)
  const baseName = fileName.split(/[/\\]/).pop();

  // Replace any character not in [a-zA-Z0-9._-] with an underscore
  const safeBase = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Ensure it has .pdf extension
  return safeBase.toLowerCase().endsWith(".pdf") ? safeBase : `${safeBase}.pdf`;
}
