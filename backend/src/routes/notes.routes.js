import { Router } from "express";
import {
  getNotes,
  getNoteById,
  uploadNote,
  updateNote,
  deleteNote,
  getMyNotes,
  downloadNote,
  serveLocalFile
} from "../controllers/notes.controller.js";
import { createReport } from "../controllers/reports.controller.js";
import { authenticate, optionalAuthenticate } from "../middleware/auth.middleware.js";
import { uploadPdf } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createNoteSchema,
  updateNoteSchema,
  queryNotesSchema
} from "../validators/notes.validator.js";
import { createReportForNoteSchema } from "../validators/reports.validator.js";

const router = Router();

// Public routes (with optional auth to detect bookmarked state)
router.get("/", optionalAuthenticate, validate(queryNotesSchema, "query"), getNotes);
router.get("/mine", authenticate, getMyNotes);
router.get("/:id", optionalAuthenticate, getNoteById);
router.get("/:id/download", downloadNote);
router.get("/file/:filename", serveLocalFile);

// Protected routes
router.post("/", authenticate, uploadPdf, validate(createNoteSchema), uploadNote);
router.patch("/:id", authenticate, validate(updateNoteSchema), updateNote);
router.delete("/:id", authenticate, deleteNote);

// Note-specific report endpoint (POST /api/notes/:id/reports)
router.post("/:id/reports", authenticate, validate(createReportForNoteSchema), createReport);

export default router;
