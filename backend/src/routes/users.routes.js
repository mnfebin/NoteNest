import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/users.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateProfileSchema } from "../validators/users.validator.js";

const router = Router();

router.use(authenticate);

router.get("/me", getProfile);
router.patch("/me", validate(updateProfileSchema), updateProfile);

export default router;
