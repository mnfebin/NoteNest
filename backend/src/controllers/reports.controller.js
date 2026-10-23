import prisma from "../config/prisma.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Submit a report for an issue with a note.
 */
export async function createReport(req, res, next) {
  try {
    const { noteId, reason, description = "" } = req.body;

    const note = await prisma.note.findUnique({
      where: { id: noteId }
    });

    if (!note) {
      return sendError(res, {
        statusCode: 404,
        message: "The note you are trying to report does not exist."
      });
    }

    // Prevent duplicate open reports for the exact same note by the same user
    const existingOpenReport = await prisma.report.findFirst({
      where: {
        noteId,
        reporterId: req.user.id,
        status: "OPEN"
      }
    });

    if (existingOpenReport) {
      return sendError(res, {
        statusCode: 409,
        message: "You have already submitted an active report for this note. Our moderators are reviewing it."
      });
    }

    const report = await prisma.report.create({
      data: {
        noteId,
        reporterId: req.user.id,
        reason,
        description: description || "No additional comments provided."
      },
      include: {
        note: {
          select: { id: true, title: true }
        }
      }
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Report submitted to administrators. Thank you for keeping NoteNest high quality!",
      data: {
        id: report.id,
        noteId: report.noteId,
        noteTitle: report.note?.title || "Note",
        reason: report.reason,
        details: report.description,
        reporter: req.user.email,
        status: report.status,
        date: report.createdAt.toISOString().split("T")[0]
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
    const reports = await prisma.report.findMany({
      where: { reporterId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        note: {
          select: { id: true, title: true, subject: true }
        }
      }
    });

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
        date: r.createdAt.toISOString().split("T")[0]
      }))
    });
  } catch (error) {
    next(error);
  }
}
