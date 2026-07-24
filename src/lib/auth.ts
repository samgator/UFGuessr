import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "ufguessr_default_super_secret_key_123456";

export function signToken(payload: { userId: number; username: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string): { userId: number; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
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
