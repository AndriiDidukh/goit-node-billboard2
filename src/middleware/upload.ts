import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import multer from "multer";

const uploadsDirectory = resolve(process.cwd(), "uploads");
mkdirSync(uploadsDirectory, { recursive: true });

export const upload = multer({
  dest: uploadsDirectory,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith("image/")),
});
