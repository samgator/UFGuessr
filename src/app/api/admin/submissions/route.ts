import { NextRequest, NextResponse } from "next/server";
import { prisma, serializeLocation } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pending = await prisma.location.findMany({
      where: { approved: false },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pending.map(serializeLocation));
  } catch (error) {
    console.error("GET admin submissions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
