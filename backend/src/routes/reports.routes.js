import { Router } from "express";
import { createReport, getMyReports } from "../controllers/reports.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createReportSchema } from "../validators/reports.validator.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(createReportSchema), createReport);
router.get("/mine", getMyReports);

export default router;
