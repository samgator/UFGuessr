import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, score, distance, locationId, locationName } = body;

    if (!date || typeof score !== "number" || typeof distance !== "number") {
      return NextResponse.json({ error: "Missing required stat fields" }, { status: 400 });
    }

    // Extract basic user information from headers
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : req.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown User Agent";

    const stat = await prisma.dailyStat.create({
      data: {
        date: String(date),
        score: Math.round(score),
        distance: Number(distance),
        locationId: locationId ? Number(locationId) : null,
        locationName: locationName ? String(locationName) : null,
        ipAddress,
        userAgent,
        shared: false,
      },
    });

    return NextResponse.json({ success: true, statId: stat.id });
  } catch (error) {
    console.error("Error logging daily stat:", error);
    return NextResponse.json({ error: "Failed to log daily stat" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { statId, date } = body;

    if (statId) {
      const updated = await prisma.dailyStat.update({
        where: { id: Number(statId) },
        data: { shared: true },
      });
      return NextResponse.json({ success: true, statId: updated.id, shared: updated.shared });
    }

    // Fallback: if statId is missing, mark latest stat for date and client IP as shared
    if (date) {
      const forwardedFor = req.headers.get("x-forwarded-for");
      const ipAddress = forwardedFor
        ? forwardedFor.split(",")[0].trim()
        : req.headers.get("x-real-ip") || "127.0.0.1";

      const latestStat = await prisma.dailyStat.findFirst({
        where: { date: String(date), ipAddress },
        orderBy: { completedAt: "desc" },
      });

      if (latestStat) {
        const updated = await prisma.dailyStat.update({
          where: { id: latestStat.id },
          data: { shared: true },
        });
        return NextResponse.json({ success: true, statId: updated.id, shared: updated.shared });
      }
    }

    return NextResponse.json({ error: "Stat record not found to update share status" }, { status: 404 });
  } catch (error) {
    console.error("Error updating share stat:", error);
    return NextResponse.json({ error: "Failed to update share status" }, { status: 500 });
  }
}
