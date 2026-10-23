import { ReportsRepository } from "../repositories/reports.repository.js";
import { NotesRepository } from "../repositories/notes.repository.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Submit a report for an issue with a note.
 * Supports both body { noteId } and route parameter :id.
 */
export async function createReport(req, res, next) {
  try {
    const noteId = req.params?.id || req.body?.noteId;
    const { reason, description = "" } = req.body;

    if (!noteId) {
      return sendError(res, {
        statusCode: 400,
        message: "Note ID is required to submit a report."
      });
    }

    const note = await NotesRepository.findNoteById(noteId);

    if (!note || note.status === "REMOVED") {
      return sendError(res, {
        statusCode: 404,
        message: "The note you are trying to report does not exist or has been removed."
      });
    }

    // Prevent duplicate open reports for the exact same note by the same user
    const existingOpenReport = await ReportsRepository.findExistingOpenReport(noteId, req.user.id);

    if (existingOpenReport) {
      return sendError(res, {
        statusCode: 409,
        message: "You have already submitted an active report for this note. Our moderators are reviewing it."
      });
    }

    const report = await ReportsRepository.createReport({
      noteId,
      reporterId: req.user.id,
      reason,
      description
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Report submitted to administrators. Thank you for keeping NoteNest high quality!",
      data: {
        id: report.id,
        noteId: report.noteId,
        noteTitle: report.note?.title || note.title,
        reason: report.reason,
        details: report.description,
        reporter: req.user.email,
        status: report.status,
        date: report.createdAt instanceof Date ? report.createdAt.toISOString().split("T")[0] : ""
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve reports submitted by the logged-in user.
 */
export async function getMyReports(req, res, next) {
  try {
    const reports = await ReportsRepository.getUserReports(req.user.id);

    return sendSuccess(res, {
      statusCode: 200,
      message: "User reports retrieved",
      data: reports.map((r) => ({
        id: r.id,
        noteId: r.noteId,
        noteTitle: r.note?.title || "Deleted Note",
        reason: r.reason,
        details: r.description,
        status: r.status,
        date: r.createdAt instanceof Date ? r.createdAt.toISOString().split("T")[0] : ""
      }))
    });
  } catch (error) {
    next(error);
  }
}
