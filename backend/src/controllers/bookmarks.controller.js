import { BookmarksRepository } from "../repositories/bookmarks.repository.js";
import { NotesRepository } from "../repositories/notes.repository.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Get all notes bookmarked by the logged-in user.
 */
export async function getBookmarks(req, res, next) {
  try {
    const bookmarks = await BookmarksRepository.getUserBookmarks(req.user.id);

    const bookmarkedNotes = bookmarks
      .filter((b) => b.note !== null && b.note.status !== "REMOVED")
      .map((b) => ({
        id: b.note.id,
        title: b.note.title,
        description: b.note.description,
        subject: b.note.subject,
        semester: b.note.semester,
        topic: b.note.topic,
        uploader: b.note.uploader?.name || "Verified Student",
        uploaderEmail: b.note.uploader?.email || "",
        uploadDate: b.note.createdAt instanceof Date ? b.note.createdAt.toISOString().split("T")[0] : "",
        createdAt: b.note.createdAt,
        fileKey: b.note.fileKey || null,
        fileType: b.note.fileType || "PDF",
        mimeType: b.note.mimeType || "application/pdf",
        fileSize: b.note.fileSize,
        fileName: b.note.fileName,
        fileUrl: b.note.fileUrl,
        downloads: b.note.downloadCount,
        previewPages: b.note.previewPages,
        tags: Array.isArray(b.note.tags) ? b.note.tags : [],
        keyConcepts: Array.isArray(b.note.keyConcepts) ? b.note.keyConcepts : [],
        isBookmarked: true
      }));

    return sendSuccess(res, {
      statusCode: 200,
      message: "Bookmarks retrieved successfully",
      data: bookmarkedNotes
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add a note to the logged-in user's bookmarks.
 */
export async function addBookmark(req, res, next) {
  try {
    const { noteId } = req.params;

    // Check if note exists and is active
    const note = await NotesRepository.findNoteById(noteId);

    if (!note || note.status === "REMOVED") {
      return sendError(res, {
        statusCode: 404,
        message: "Note not found or has been removed."
      });
    }

    // Upsert via BookmarksRepository to prevent duplicate bookmark errors
    const bookmark = await BookmarksRepository.addBookmark(req.user.id, noteId);

    return sendSuccess(res, {
      statusCode: 201,
      message: "Note saved to your library",
      data: bookmark
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove a note from the logged-in user's bookmarks.
 */
export async function removeBookmark(req, res, next) {
  try {
    const { noteId } = req.params;

    await BookmarksRepository.removeBookmark(req.user.id, noteId);

    return sendSuccess(res, {
      statusCode: 200,
      message: "Note removed from your library"
    });
  } catch (error) {
    next(error);
  }
}
