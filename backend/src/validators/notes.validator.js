import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  subject: z.string().trim().min(2, "Subject is required"),
  semester: z.coerce.number().int().min(1).max(8),
  topic: z.string().trim().min(2, "Topic/module is required"),
  tags: z.union([z.array(z.string()), z.string()]).optional().transform((val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  }),
  keyConcepts: z.union([z.array(z.string()), z.string()]).optional().transform((val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not json, split by newline or comma
    }
    return val.split("\n").map((s) => s.trim()).filter(Boolean);
  })
});

export const updateNoteSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(10).optional(),
  subject: z.string().trim().min(2).optional(),
  semester: z.coerce.number().int().min(1).max(8).optional(),
  topic: z.string().trim().min(2).optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional().transform((val) => {
    if (!val) return undefined;
    if (Array.isArray(val)) return val;
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  }),
  keyConcepts: z.union([z.array(z.string()), z.string()]).optional().transform((val) => {
    if (!val) return undefined;
    if (Array.isArray(val)) return val;
    return val.split("\n").map((s) => s.trim()).filter(Boolean);
  })
});

export const queryNotesSchema = z.object({
  search: z.string().optional().default(""),
  subject: z.string().optional().default(""),
  semester: z.string().optional().default(""),
  topic: z.string().optional().default(""),
  sort: z.enum(["newest", "popular", "alphabetical"]).optional().default("newest"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional()
});
