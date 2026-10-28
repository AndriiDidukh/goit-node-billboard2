import { unlink } from "node:fs/promises";
import { v2 as cloudinary } from "cloudinary";
import type { Express } from "express";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file: Express.Multer.File): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(file.path, { folder: "announcements" });
    return result.secure_url;
  } finally {
    await unlink(file.path).catch(() => undefined);
  }
}
