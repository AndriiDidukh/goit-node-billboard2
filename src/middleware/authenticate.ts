import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, getSecret());
    if (typeof payload === "string" || typeof payload.sub !== "number") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = payload as typeof req.user & { sub: number };
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
