import prisma from "../config/prisma.js";
import { StorageService } from "../services/storage.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Get overall system statistics for the Admin Dashboard.
 */
export async function getDashboardStats(req, res, next) {
  try {
    const [
      totalUsers,
      totalNotes,
      pendingNotes,
      approvedNotes,
      rejectedNotes,
      openReports,
      allNotes
    ] = await Promise.all([
      prisma.user.count(),
      prisma.note.count(),
      prisma.note.count({ where: { status: "PENDING" } }),
      prisma.note.count({ where: { status: "APPROVED" } }),
      prisma.note.count({ where: { status: "REJECTED" } }),
      prisma.report.count({ where: { status: "OPEN" } }),
      prisma.note.findMany({ select: { downloadCount: true } })
    ]);

    const totalDownloads = allNotes.reduce((sum, n) => sum + (n.downloadCount || 0), 0);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Admin dashboard metrics retrieved",
      data: {
        totalUsers,
        totalNotes,
        pendingNotes,
        approvedNotes,
        rejectedNotes,
        openReports,
        totalDownloads
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List and search users.
 */
export async function getUsers(req, res, next) {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (role) {
      where.role = role;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { studentId: { contains: q, mode: "insensitive" } }
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          semester: true,
          branch: true,
          college: true,
          studentId: true,
          createdAt: true,
          _count: {
            select: { notes: true, bookmarks: true }
          }
        }
      })
    ]);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Users retrieved successfully",
      data: users,
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
 * List all notes for governance, with status filter.
 */
export async function getAdminNotes(req, res, next) {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { subject: { contains: q, mode: "insensitive" } },
        { uploader: { name: { contains: q, mode: "insensitive" } } }
      ];
    }

    const [total, notes] = await Promise.all([
      prisma.note.count({ where }),
      prisma.note.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
        include: {
          uploader: {
            select: { id: true, name: true, email: true }
          },
          _count: {
            select: { reports: true }
          }
        }
      })
    ]);

    const formatted = notes.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      subject: n.subject,
      semester: n.semester,
      topic: n.topic,
      uploader: n.uploader?.name || "Student",
      uploaderEmail: n.uploader?.email || "",
      uploaderId: n.uploaderId,
      uploadDate: n.createdAt.toISOString().split("T")[0],
      createdAt: n.createdAt,
      fileType: n.fileType,
      fileSize: n.fileSize,
      fileName: n.fileName,
      fileUrl: n.fileUrl,
      downloads: n.downloadCount,
      downloadCount: n.downloadCount,
      status: n.status,
      reportsCount: n._count?.reports || 0,
      tags: n.tags,
      keyConcepts: n.keyConcepts
    }));

    return sendSuccess(res, {
      statusCode: 200,
      message: "Admin notes list retrieved",
      data: formatted,
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
 * Approve or reject a note.
 */
export async function updateNoteStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return sendError(res, {
        statusCode: 400,
        message: "Status must be PENDING, APPROVED, or REJECTED."
      });
    }

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) {
      return sendError(res, { statusCode: 404, message: "Note not found." });
    }

    const updated = await prisma.note.update({
      where: { id },
      data: { status },
      include: {
        uploader: { select: { id: true, name: true, email: true } }
      }
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: `Note status successfully updated to ${status}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a note permanently as an administrator.
 */
export async function adminDeleteNote(req, res, next) {
  try {
    const { id } = req.params;

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) {
      return sendError(res, { statusCode: 404, message: "Note not found." });
    }

    await prisma.note.delete({ where: { id } });

    if (note.fileUrl) {
      try {
        await StorageService.deleteFile(note.fileUrl);
      } catch (err) {
        console.warn("Storage deletion warning:", err.message);
      }
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: "Note removed permanently by administrator."
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List all reports for moderation review.
 */
export async function getAdminReports(req, res, next) {
  try {
    const { status } = req.query;

    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        note: {
          select: { id: true, title: true, subject: true, uploader: { select: { name: true } } }
        },
        reporter: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    const formatted = reports.map((r) => ({
      id: r.id,
      noteId: r.noteId,
      noteTitle: r.note?.title || "Deleted Note",
      noteSubject: r.note?.subject || "",
      reason: r.reason,
      details: r.description,
      reporter: r.reporter?.email || "Student",
      reporterName: r.reporter?.name || "Student",
      date: r.createdAt.toISOString().split("T")[0],
      createdAt: r.createdAt,
      status: r.status
    }));

    return sendSuccess(res, {
      statusCode: 200,
      message: "Admin reports retrieved",
      data: formatted
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update report status (e.g. REVIEWED, RESOLVED, DISMISSED).
 */
export async function updateReportStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["OPEN", "REVIEWED", "RESOLVED", "DISMISSED"].includes(status)) {
      return sendError(res, {
        statusCode: 400,
        message: "Status must be OPEN, REVIEWED, RESOLVED, or DISMISSED."
      });
    }

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return sendError(res, { statusCode: 404, message: "Report not found." });
    }

    const updated = await prisma.report.update({
      where: { id },
      data: { status }
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: `Report marked as ${status}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}
