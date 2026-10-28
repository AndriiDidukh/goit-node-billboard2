import { Router } from "express";
import { z } from "zod";
import { registry } from "../openapi.ts";
import { authenticate } from "../middleware/authenticate.ts";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.ts";
import { createAnnouncement, deleteAnnouncement, getAnnouncement, listAnnouncements, updateAnnouncement } from "../controllers/announcements.controller.ts";
import { announcementIdSchema, announcementsQuerySchema, createAnnouncementSchema, updateAnnouncementSchema } from "../validators/announcements.validator.ts";
import { upload } from "../middleware/upload.ts";

const router = Router();

router.get("/", validateQuery(announcementsQuerySchema), listAnnouncements);
router.get("/:id", validateParams(announcementIdSchema), getAnnouncement);
router.post("/", authenticate, upload.single("image"), validateBody(createAnnouncementSchema), createAnnouncement);
router.patch("/:id", authenticate, validateParams(announcementIdSchema), upload.single("image"), validateBody(updateAnnouncementSchema), updateAnnouncement);
router.delete("/:id", authenticate, validateParams(announcementIdSchema), deleteAnnouncement);

registry.registerPath({ method: "get", path: "/announcements", summary: "List announcements", request: { query: announcementsQuerySchema }, responses: { 200: { description: "Announcements" } } });
registry.registerPath({ method: "get", path: "/announcements/{id}", summary: "Get an announcement", request: { params: announcementIdSchema }, responses: { 200: { description: "Announcement" }, 404: { description: "Not found" } } });
const createMultipartSchema = createAnnouncementSchema.extend({ image: z.string().openapi({ format: "binary" }).optional() });
const updateMultipartSchema = updateAnnouncementSchema.extend({ image: z.string().openapi({ format: "binary" }).optional() });
registry.registerPath({ method: "post", path: "/announcements", summary: "Create an announcement", security: [{ bearerAuth: [] }], request: { body: { content: { "multipart/form-data": { schema: createMultipartSchema } } } }, responses: { 201: { description: "Created" } } });
registry.registerPath({ method: "patch", path: "/announcements/{id}", summary: "Update an announcement", security: [{ bearerAuth: [] }], request: { params: announcementIdSchema, body: { content: { "multipart/form-data": { schema: updateMultipartSchema } } } }, responses: { 200: { description: "Updated" }, 403: { description: "Access denied" } } });
registry.registerPath({ method: "delete", path: "/announcements/{id}", summary: "Delete an announcement", security: [{ bearerAuth: [] }], request: { params: announcementIdSchema }, responses: { 204: { description: "Deleted" } } });

export default router;
