import type { Request, Response } from "express";
import createError from "http-errors";
import prisma from "../../prisma/client.ts";
import logger from "../logger.ts";
import { uploadToCloudinary } from "../services/cloudinary.ts";

const author = { id: true, username: true, email: true, name: true };
const withAuthor = { user: { select: author } };

export async function listAnnouncements(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const where = search ? { title: { contains: search, mode: "insensitive" as const } } : {};
  const [data, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      include: withAuthor,
      orderBy: { createdAt: req.query.sort === "oldest" ? "asc" : "desc" },
      skip: (page - 1) * 10,
      take: 10,
    }),
    prisma.announcement.count({ where }),
  ]);
  res.json({ data, pagination: { total, page, totalPages: Math.ceil(total / 10), perPage: 10 } });
}

export async function getAnnouncement(req: Request, res: Response) {
  const announcement = await prisma.announcement.findUnique({
    where: { id: Number(req.params.id) }, include: withAuthor,
  });
  if (!announcement) throw createError(404, "Announcement not found");
  res.json(announcement);
}

export async function createAnnouncement(req: Request, res: Response) {
  const imageUrl = req.file ? await uploadToCloudinary(req.file) : undefined;
  if (imageUrl) logger.info({ userId: req.user!.sub, imageUrl }, "Announcement photo uploaded");
  const announcement = await prisma.announcement.create({
    data: { ...req.body, imageUrl, userId: req.user!.sub }, include: withAuthor,
  });
  logger.info({ announcementId: announcement.id, userId: req.user!.sub }, "Announcement created");
  res.status(201).json(announcement);
}

async function ownedAnnouncement(req: Request) {
  const announcement = await prisma.announcement.findUnique({ where: { id: Number(req.params.id) } });
  if (!announcement) throw createError(404, "Announcement not found");
  if (announcement.userId !== req.user!.sub) throw createError(403, "Access denied");
  return announcement;
}

export async function updateAnnouncement(req: Request, res: Response) {
  await ownedAnnouncement(req);
  const imageUrl = req.file ? await uploadToCloudinary(req.file) : undefined;
  if (imageUrl) logger.info({ announcementId: Number(req.params.id), imageUrl }, "Announcement photo uploaded");
  const announcement = await prisma.announcement.update({
    where: { id: Number(req.params.id) }, data: { ...req.body, ...(imageUrl ? { imageUrl } : {}) }, include: withAuthor,
  });
  res.json(announcement);
}

export async function deleteAnnouncement(req: Request, res: Response) {
  await ownedAnnouncement(req);
  await prisma.announcement.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
}
