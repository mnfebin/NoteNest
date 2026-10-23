import prisma from "../config/prisma.js";

/**
 * Notes Repository: Encapsulates all Prisma database queries and CRUD operations for Notes.
 * Note: Never sends Express HTTP responses from repository functions.
 */
export class NotesRepository {
  /**
   * Create a new note record in PostgreSQL via Prisma.
   */
  static async createNote(data) {
    return prisma.note.create({
      data: {
        title: data.title,
        description: data.description,
        subject: data.subject,
        semester: Number(data.semester),
        topic: data.topic,
        uploaderId: data.uploaderId,
        fileKey: data.fileKey || null,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        fileType: data.fileType || "PDF",
        mimeType: data.mimeType || "application/pdf",
        status: data.status || "PENDING",
        previewPages: data.previewPages !== undefined ? Number(data.previewPages) : 12,
        tags: Array.isArray(data.tags) ? data.tags : [],
        keyConcepts: Array.isArray(data.keyConcepts) ? data.keyConcepts : []
      },
      include: {
        uploader: {
          select: { id: true, name: true, email: true, semester: true, college: true }
        }
      }
    });
  }

  /**
   * Retrieve active notes with search query, subject filter, semester filter, topic filter,
   * pagination, and sorting.
   */
  static async findActiveNotes({
    search = "",
    subject = "",
    semester = "",
    topic = "",
    sort = "newest",
    skip = 0,
    take = 12,
    status = "APPROVED",
    includeBookmarksForUserId = null
  }) {
    const where = {};

    // Filter by note status (e.g. APPROVED by default, never REMOVED for regular students)
    if (status) {
      where.status = status;
    } else {
      where.status = { not: "REMOVED" };
    }

    // Filter by subject
    if (subject && subject !== "All Subjects" && subject !== "all") {
      where.subject = { equals: subject, mode: "insensitive" };
    }

    // Filter by semester
    if (semester && semester !== "all") {
      where.semester = parseInt(semester, 10);
    }

    // Filter by topic
    if (topic && topic !== "All Topics" && topic !== "all") {
      where.topic = { contains: topic, mode: "insensitive" };
    }

    // Search by title, description, topic, or subject
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { topic: { contains: q, mode: "insensitive" } },
        { subject: { contains: q, mode: "insensitive" } }
      ];
    }

    // Determine sorting order
    let orderBy = { createdAt: "desc" };
    if (sort === "popular") {
      orderBy = { downloadCount: "desc" };
    } else if (sort === "alphabetical") {
      orderBy = { title: "asc" };
    } else if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    }

    const [total, notes] = await Promise.all([
      prisma.note.count({ where }),
      prisma.note.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          uploader: {
            select: { id: true, name: true, email: true, semester: true, college: true }
          },
          bookmarks: includeBookmarksForUserId
            ? {
                where: { userId: includeBookmarksForUserId },
                select: { userId: true }
              }
            : false
        }
      })
    ]);

    return { total, notes };
  }

  /**
   * Find a single note by ID, including its uploader and optional bookmark check.
   */
  static async findNoteById(id, { includeBookmarksForUserId = null } = {}) {
    return prisma.note.findUnique({
      where: { id },
      include: {
        uploader: {
          select: { id: true, name: true, email: true, semester: true, college: true }
        },
        bookmarks: includeBookmarksForUserId
          ? {
              where: { userId: includeBookmarksForUserId },
              select: { userId: true }
            }
          : false
      }
    });
  }

  /**
   * Update note metadata.
   */
  static async updateNote(id, updateData) {
    return prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        uploader: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  /**
   * Mark a note as REMOVED (Soft Delete).
   * Keeps audit trail, bookmark history, and moderation records safe.
   */
  static async markNoteAsRemoved(id) {
    return prisma.note.update({
      where: { id },
      data: { status: "REMOVED" }
    });
  }

  /**
   * Delete a note record permanently (Hard Delete).
   */
  static async deleteNotePermanently(id) {
    return prisma.note.delete({
      where: { id }
    });
  }

  /**
   * Atomically increment the note's download counter.
   */
  static async incrementDownloadCount(id) {
    return prisma.note.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 }
      }
    });
  }

  /**
   * Retrieve all notes uploaded by a specific user.
   */
  static async findNotesByUploader(uploaderId) {
    return prisma.note.findMany({
      where: {
        uploaderId,
        status: { not: "REMOVED" }
      },
      orderBy: { createdAt: "desc" },
      include: {
        uploader: {
          select: { id: true, name: true, email: true }
        },
        bookmarks: {
          where: { userId: uploaderId },
          select: { userId: true }
        }
      }
    });
  }

  /**
   * Count total notes matching criteria.
   */
  static async countNotes(where = {}) {
    return prisma.note.count({ where });
  }
}

export default NotesRepository;
