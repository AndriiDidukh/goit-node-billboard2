import { z } from "zod";

const announcementFields = {
  title: z.string().trim().min(5).max(50),
  description: z.string().trim().min(10),
  price: z.coerce.number().positive(),
  category: z.enum(["sale", "service", "job", "other"]),
};

export const createAnnouncementSchema = z.object(announcementFields);
export const updateAnnouncementSchema = z.object(announcementFields).partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided" },
);
export const announcementIdSchema = z.object({ id: z.coerce.number().int().positive() });
export const announcementsQuerySchema = z.object({
  search: z.string().optional(),
  sort: z.enum(["newest", "oldest"]).optional(),
  page: z.coerce.number().int().positive().optional(),
});
