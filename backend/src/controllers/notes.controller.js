import path from "path";
import fs from "fs";
import { NotesRepository } from "../repositories/notes.repository.js";
import { StorageService } from "../services/storage.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { sanitizeFileName } from "../utils/fileValidation.js";

/**
 * Format a Note database record for consistent API consumption across frontend and admin modules.
 */
function formatNote(note, currentUserId = null) {
  const isBookmarked =
    currentUserId && note.bookmarks
      ? note.bookmarks.some((b) => b.userId === currentUserId)
      : false;

  return {
    id: note.id,
    title: note.title,
    description: note.description,
    subject: note.subject,
    semester: note.semester,
    topic: note.topic,
    uploader: note.uploader?.name || "Verified Student",
    uploaderEmail: note.uploader?.email || "",
    uploaderId: note.uploaderId,
    uploadDate: note.createdAt instanceof Date ? note.createdAt.toISOString().split("T")[0] : "",
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    fileKey: note.fileKey || null,
    fileType: note.fileType || "PDF",
    mimeType: note.mimeType || "application/pdf",
    fileSize: note.fileSize,
    fileName: note.fileName,
    fileUrl: note.fileUrl,
    downloads: note.downloadCount,
    downloadCount: note.downloadCount,
    status: note.status,
    previewPages: note.previewPages,
    tags: Array.isArray(note.tags) ? note.tags : [],
    keyConcepts: Array.isArray(note.keyConcepts) ? note.keyConcepts : [],
    isBookmarked
  };
}

/**
 * List notes with search, filtering, sorting, and pagination.
 */
export async function getNotes(req, res, next) {
  try {
    const {
      search,
      subject,
      semester,
      topic,
      sort = "newest",
      page = 1,
      limit = 12,
      status
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const isAdmin = req.user?.role === "ADMIN";
    const statusFilter = status && isAdmin ? status : "APPROVED";

    const { total, notes } = await NotesRepository.findActiveNotes({
      search,
      subject,
      semester,
      topic,
      sort,
      skip,
      take: limitNum,
      status: statusFilter,
      includeBookmarksForUserId: req.user?.id
    });

    const formattedNotes = notes.map((n) => formatNote(n, req.user?.id));

    return sendSuccess(res, {
      statusCode: 200,
      message: "Notes retrieved successfully",
      data: formattedNotes,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single note by ID.
 */
export async function getNoteById(req, res, next) {
  try {
    const { id } = req.params;

    const note = await NotesRepository.findNoteById(id, {
      includeBookmarksForUserId: req.user?.id
    });

    if (!note || note.status === "REMOVED") {
      return sendError(res, {
        statusCode: 404,
        message: "Note not found or has been removed."
      });
    }

    // Only allow viewing if approved, or if requester is the uploader or an admin
    const isOwner = req.user?.id === note.uploaderId;
    const isAdmin = req.user?.role === "ADMIN";

    if (note.status !== "APPROVED" && !isOwner && !isAdmin) {
      return sendError(res, {
        statusCode: 404,
        message: "This note is pending approval or has been restricted."
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Note details retrieved",
      data: formatNote(note, req.user?.id)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Upload a note and its PDF file.
 */
export async function uploadNote(req, res, next) {
  let uploadedFileKey = null;

  try {
    if (!req.file) {
      return sendError(res, {
        statusCode: 400,
        message: "Please attach a valid PDF file (.pdf) for the study note."
      });
    }

    const {
      title,
      description,
      subject,
      semester,
      topic,
      tags = [],
      keyConcepts = []
    } = req.body;

    const fileSizeFormatted = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;

    // 1. Upload PDF buffer to Supabase Storage (or test fallback)
    const uploadResult = await StorageService.uploadFile({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: "application/pdf"
    });

    uploadedFileKey = uploadResult.fileKey;

    // Normal student uploads start as PENDING for admin review (APPROVED for admins)
    const initialStatus = req.user.role === "ADMIN" ? "APPROVED" : "PENDING";

    // 2. Persist note metadata and fileKey in PostgreSQL via NotesRepository
    const note = await NotesRepository.createNote({
      title,
      description,
      subject,
      semester: parseInt(semester, 10),
      topic,
      uploaderId: req.user.id,
      fileKey: uploadResult.fileKey,
      fileName: sanitizeFileName(req.file.originalname),
      fileUrl: uploadResult.fileUrl,
      fileSize: fileSizeFormatted,
      fileType: "PDF",
      mimeType: "application/pdf",
      status: initialStatus,
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      keyConcepts: Array.isArray(keyConcepts) ? keyConcepts : [keyConcepts].filter(Boolean)
    });

    return sendSuccess(res, {
      statusCode: 201,
      message:
        note.status === "APPROVED"
          ? "Note uploaded and published successfully!"
          : "Note uploaded successfully! It is currently pending review by administrators before appearing publicly.",
      data: formatNote(note, req.user.id)
    });
  } catch (error) {
    // Clean up uploaded file in storage if PostgreSQL insert fails (Prevents orphaned files)
    if (uploadedFileKey) {
      try {
        await StorageService.deleteFile(uploadedFileKey);
      } catch (cleanupErr) {
        console.error("Failed to clean up file after error:", cleanupErr);
      }
    }
    next(error);
  }
}

/**
 * Edit a note's metadata (Owner or Admin).
 */
export async function updateNote(req, res, next) {
  try {
    const { id } = req.params;

    const note = await NotesRepository.findNoteById(id);

    if (!note || note.status === "REMOVED") {
      return sendError(res, { statusCode: 404, message: "Note not found." });
    }

    const isOwner = note.uploaderId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return sendError(res, {
        statusCode: 403,
        message: "Forbidden: You do not have permission to edit this note."
      });
    }

    const { title, description, subject, semester, topic, tags, keyConcepts } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (subject !== undefined) updateData.subject = subject;
    if (semester !== undefined) updateData.semester = parseInt(semester, 10);
    if (topic !== undefined) updateData.topic = topic;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (keyConcepts !== undefined) updateData.keyConcepts = Array.isArray(keyConcepts) ? keyConcepts : [];

    const updated = await NotesRepository.updateNote(id, updateData);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Note updated successfully",
      data: formatNote(updated, req.user.id)
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a note.
 * Uses safe soft-delete (status = 'REMOVED') to preserve report history.
 * Supports permanent delete if requested by admin with ?permanent=true.
 */
export async function deleteNote(req, res, next) {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    const note = await NotesRepository.findNoteById(id);

    if (!note || note.status === "REMOVED") {
      return sendError(res, { statusCode: 404, message: "Note not found." });
    }

    const isOwner = note.uploaderId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return sendError(res, {
        statusCode: 403,
        message: "Forbidden: You do not have permission to delete this note."
      });
    }

    if (permanent === "true" && isAdmin) {
      // Hard delete from database
      await NotesRepository.deleteNotePermanently(id);

      // Clean up file from storage
      const storageTarget = note.fileKey || note.fileUrl;
      if (storageTarget) {
        await StorageService.deleteFile(storageTarget);
      }

      return sendSuccess(res, {
        statusCode: 200,
        message: "Note and associated PDF file deleted permanently."
      });
    }

    // Default safe strategy: Soft Delete
    await NotesRepository.markNoteAsRemoved(id);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Note removed from active listings successfully."
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve notes uploaded by the current authenticated user.
 */
export async function getMyNotes(req, res, next) {
  try {
    const notes = await NotesRepository.findNotesByUploader(req.user.id);

    return sendSuccess(res, {
      statusCode: 200,
      message: "User uploaded notes retrieved",
      data: notes.map((n) => formatNote(n, req.user.id))
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Download a note and increment download counter.
 * Returns a short-lived signed URL (60s).
 */
export async function downloadNote(req, res, next) {
  try {
    const { id } = req.params;

    const note = await NotesRepository.findNoteById(id);

    if (!note || note.status === "REMOVED") {
      return sendError(res, { statusCode: 404, message: "Note not found or has been removed." });
    }

    // Atomically increment download counter
    const updated = await NotesRepository.incrementDownloadCount(id);

    // Generate short-lived signed download URL (60 seconds)
    const storageTarget = note.fileKey || note.fileUrl;
    const downloadUrl = await StorageService.getDownloadUrl(storageTarget, 60);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Download initiated successfully",
      data: {
        downloadUrl: downloadUrl || note.fileUrl,
        fileName: sanitizeFileName(note.fileName),
        downloads: updated.downloadCount,
        expiresInSeconds: 60
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Serve local files if offline/local storage was used.
 */
export async function serveLocalFile(req, res) {
  const { filename } = req.params;
  const safeFilename = path.basename(filename);
  const filePath = path.resolve(process.cwd(), "uploads", safeFilename);

  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
    return fs.createReadStream(filePath).pipe(res);
  }

  return sendError(res, { statusCode: 404, message: "File not found" });
}
