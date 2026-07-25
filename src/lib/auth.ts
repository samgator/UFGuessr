import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "./db";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[Security Warning] JWT_SECRET environment variable is missing. Configure JWT_SECRET in production.");
    }
    return "ufguessr_default_fallback_secret_key_123456";
  }
  return secret;
}

export function signToken(payload: { userId: number; username: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "1d" });
}

export function verifyToken(token: string): { userId: number; username: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { userId: number; username: string };
  } catch {
    return null;
  }
}

export async function getAdminFromRequest(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const admin = await prisma.admin.findUnique({
    where: { id: payload.userId },
    select: { id: true, username: true },
  });

  return admin;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
