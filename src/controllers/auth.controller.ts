import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import prisma from "../../prisma/client.ts";
import logger from "../logger.ts";

const publicUser = { id: true, username: true, email: true, name: true, createdAt: true };

function secret(): string {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET is not configured");
  return value;
}

function tokenPair(userId: number) {
  return {
    accessToken: jwt.sign({ sub: userId }, secret(), { expiresIn: "15m" }),
    refreshToken: jwt.sign({ sub: userId }, secret(), { expiresIn: "7d" }),
  };
}

export async function register(req: Request, res: Response) {
  const { username, email, password, name } = req.body;
  const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
  if (existing) throw createError(409, "Username or email already taken");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword, name },
    select: publicUser,
  });
  const tokens = tokenPair(user.id);
  await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: user.id } });
  logger.info({ userId: user.id, username: user.username }, "User registered");
  res.status(201).json({ user: toPublicUser(user), ...tokens });
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createError(401, "Invalid credentials");
  }
  const tokens = tokenPair(user.id);
  await prisma.$transaction([
    prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
    prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: user.id } }),
  ]);
  logger.info({ userId: user.id, username: user.username }, "User logged in");
  res.json({ user: toPublicUser(user), ...tokens });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  let payload: jwt.JwtPayload | string;
  try {
    payload = jwt.verify(refreshToken, secret());
  } catch {
    throw createError(401, "Invalid refresh token");
  }
  if (typeof payload === "string" || typeof payload.sub !== "number") {
    throw createError(401, "Invalid refresh token");
  }
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.userId !== payload.sub) throw createError(401, "Invalid refresh token");

  const tokens = tokenPair(stored.userId);
  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { token: refreshToken } }),
    prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: stored.userId } }),
  ]);
  res.json(tokens);
}

export async function logout(req: Request, res: Response) {
  await prisma.refreshToken.deleteMany({ where: { token: req.body.refreshToken, userId: req.user!.sub } });
  res.status(204).end();
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub }, select: publicUser });
  if (!user) throw createError(404, "User not found");
  res.json(user);
}

function toPublicUser(user: { id: number; username: string; email: string; name: string }) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
  };
}
