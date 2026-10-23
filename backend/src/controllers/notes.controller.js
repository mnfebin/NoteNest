import prisma from "../config/prisma.js";
import { StorageService } from "../services/storage.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import path from "path";
import fs from "fs";

/**
 * Format a Note database record for consistent API consumption by frontend.
 */
function formatNote(note, currentUserId = null) {
  const isBookmarked = currentUserId && note.bookmarks
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
    uploadDate: note.createdAt.toISOString().split("T")[0],
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    fileType: note.fileType || "PDF",
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

    // Build Prisma query filter
    const where = {};

    // By default, public notes listing only displays APPROVED notes
    const isAdmin = req.user?.role === "ADMIN";
    if (status && isAdmin) {
      where.status = status;
    } else {
      where.status = "APPROVED";
    }

    if (subject && subject !== "All Subjects") {
      where.subject = { equals: subject, mode: "insensitive" };
    }

    if (semester && semester !== "all") {
      where.semester = parseInt(semester, 10);
    }

    if (topic && topic !== "All Topics") {
      where.topic = { contains: topic, mode: "insensitive" };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { topic: { contains: q, mode: "insensitive" } },
        { subject: { contains: q, mode: "insensitive" } }
      ];
    }

    // Determine sorting
    let orderBy = { createdAt: "desc" };
    if (sort === "popular") {
      orderBy = { downloadCount: "desc" };
    } else if (sort === "alphabetical") {
      orderBy = { title: "asc" };
    }

    const [total, notes] = await Promise.all([
      prisma.note.count({ where }),
      prisma.note.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          uploader: {
            select: { id: true, name: true, email: true }
          },
          bookmarks: req.user
            ? {
                where: { userId: req.user.id },
                select: { userId: true }
              }
            : false
        }
      })
    ]);

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

    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        uploader: {
          select: { id: true, name: true, email: true, semester: true, college: true }
        },
        bookmarks: req.user
          ? {
              where: { userId: req.user.id },
              select: { userId: true }
            }
          : false
      }
    });

    if (!note) {
      return sendError(res, {
        statusCode: 404,
        message: "Note not found."
      });
    }

    // Only allow viewing if approved, or if the requester is the owner or an admin
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
  let uploadedStoragePath = null;

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

    // Upload PDF to Supabase Storage (or local fallback in test/offline mode)
    const uploadResult = await StorageService.uploadFile({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: "application/pdf"
    });

    uploadedStoragePath = uploadResult.storagePath;

    // Normal student uploads start as PENDING for admin review (or APPROVED if uploaded by admin)
    const initialStatus = req.user.role === "ADMIN" ? "APPROVED" : "PENDING";

    const note = await prisma.note.create({
      data: {
        title,
        description,
        subject,
        semester: parseInt(semester, 10),
        topic,
        uploaderId: req.user.id,
        fileName: req.file.originalname,
        fileUrl: uploadResult.fileUrl,
        fileSize: fileSizeFormatted,
        fileType: "PDF",
        status: initialStatus,
        tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
        keyConcepts: Array.isArray(keyConcepts) ? keyConcepts : [keyConcepts].filter(Boolean)
      },
      include: {
        uploader: {
          select: { id: true, name: true, email: true }
        }
      }
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
    // Clean up uploaded file if DB operation fails
    if (uploadedStoragePath) {
      try {
        await StorageService.deleteFile(uploadedStoragePath);
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

    const note = await prisma.note.findUnique({
      where: { id }
    });

    if (!note) {
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

    const updated = await prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        uploader: {
          select: { id: true, name: true, email: true }
        }
      }
    });

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
 * Delete a note (Owner or Admin).
 */
export async function deleteNote(req, res, next) {
  try {
    const { id } = req.params;

    const note = await prisma.note.findUnique({
      where: { id }
    });

    if (!note) {
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

    // Delete record from database
    await prisma.note.delete({
      where: { id }
    });

    // Delete file from storage
    if (note.fileUrl) {
      try {
        await StorageService.deleteFile(note.fileUrl);
      } catch (err) {
        console.warn("Storage deletion warning:", err.message);
      }
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Note deleted successfully"
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
    const notes = await prisma.note.findMany({
      where: { uploaderId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        uploader: {
          select: { id: true, name: true, email: true }
        },
        bookmarks: {
          where: { userId: req.user.id },
          select: { userId: true }
        }
      }
    });

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
 */
export async function downloadNote(req, res, next) {
  try {
    const { id } = req.params;

    const note = await prisma.note.findUnique({
      where: { id }
    });

    if (!note) {
      return sendError(res, { statusCode: 404, message: "Note not found." });
    }

    // Increment download counter atomically
    const updated = await prisma.note.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 }
      }
    });

    // Get direct/signed download URL
    const downloadUrl = await StorageService.getDownloadUrl(note.fileUrl);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Download initiated successfully",
      data: {
        downloadUrl: downloadUrl || note.fileUrl,
        fileName: note.fileName,
        downloads: updated.downloadCount
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
