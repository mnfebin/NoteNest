import { Router } from "express";
import {
  getDashboardStats,
  getUsers,
  getAdminNotes,
  updateNoteStatus,
  adminDeleteNote,
  getAdminReports,
  updateReportStatus
} from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Restrict all administrative endpoints strictly to users with role "ADMIN"
router.use(authenticate, requireRole("ADMIN"));

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.get("/notes", getAdminNotes);
router.patch("/notes/:id/status", updateNoteStatus);
router.delete("/notes/:id", adminDeleteNote);
router.get("/reports", getAdminReports);
router.patch("/reports/:id/status", updateReportStatus);

export default router;
