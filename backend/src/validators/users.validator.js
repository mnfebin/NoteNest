import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  semester: z.coerce.number().int().min(1).max(8).optional(),
  branch: z.string().trim().optional(),
  college: z.string().trim().optional(),
  studentId: z.string().trim().optional()
});
