import prisma from "../config/prisma.js";

/**
 * Bookmarks Repository: Encapsulates all Prisma database operations for Bookmarks.
 * Note: Never sends Express HTTP responses from repository functions.
 */
export class BookmarksRepository {
  /**
   * Retrieve all active bookmarks saved by a user.
   */
  static async getUserBookmarks(userId) {
    return prisma.bookmark.findMany({
      where: {
        userId,
        note: {
          status: { not: "REMOVED" }
        }
      },
      orderBy: { createdAt: "desc" },
      include: {
        note: {
          include: {
            uploader: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });
  }

  /**
   * Find a specific bookmark by user and note ID.
   */
  static async findBookmark(userId, noteId) {
    return prisma.bookmark.findUnique({
      where: {
        userId_noteId: {
          userId,
          noteId
        }
      }
    });
  }

  /**
   * Add a note to user's bookmarks (with duplicate protection via unique constraint / upsert).
   */
  static async addBookmark(userId, noteId) {
    return prisma.bookmark.upsert({
      where: {
        userId_noteId: {
          userId,
          noteId
        }
      },
      update: {},
      create: {
        userId,
        noteId
      },
      include: {
        note: {
          select: { id: true, title: true, subject: true }
        }
      }
    });
  }

  /**
   * Remove a note from user's bookmarks.
   */
  static async removeBookmark(userId, noteId) {
    return prisma.bookmark.deleteMany({
      where: {
        userId,
        noteId
      }
    });
  }

  /**
   * Check if a specific note is bookmarked by a user.
   */
  static async isBookmarked(userId, noteId) {
    if (!userId || !noteId) return false;
    const count = await prisma.bookmark.count({
      where: {
        userId,
        noteId
      }
    });
    return count > 0;
  }
}

export default BookmarksRepository;
