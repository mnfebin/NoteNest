import { z } from "zod";

export const createReportSchema = z.object({
  noteId: z.string().min(1, "Note ID is required"),
  reason: z.string().trim().min(3, "Reason must be at least 3 characters").max(200),
  description: z.string().trim().optional().default("")
});

export const updateReportStatusSchema = z.object({
  status: z.enum(["OPEN", "REVIEWED", "RESOLVED", "DISMISSED"], {
    errorMap: () => ({ message: "Status must be OPEN, REVIEWED, RESOLVED, or DISMISSED" })
  })
});
