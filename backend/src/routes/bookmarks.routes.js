import { Router } from "express";
import {
  getBookmarks,
  addBookmark,
  removeBookmark
} from "../controllers/bookmarks.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// All bookmark routes require authentication
router.use(authenticate);

router.get("/", getBookmarks);
router.post("/:noteId", addBookmark);
router.delete("/:noteId", removeBookmark);

export default router;
