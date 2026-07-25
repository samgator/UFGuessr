import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await prisma.dailyStat.findMany({
      orderBy: {
        completedAt: "desc",
      },
    });

    const totalPlays = stats.length;
    const totalShares = stats.filter((s) => s.shared).length;
    const avgScore = totalPlays > 0 ? Math.round(stats.reduce((acc, s) => acc + s.score, 0) / totalPlays) : 0;
    const avgDistance = totalPlays > 0 ? Math.round((stats.reduce((acc, s) => acc + s.distance, 0) / totalPlays) * 10) / 10 : 0;
    const shareRate = totalPlays > 0 ? Math.round((totalShares / totalPlays) * 1000) / 10 : 0;

    return NextResponse.json({
      stats,
      summary: {
        totalPlays,
        totalShares,
        avgScore,
        avgDistance,
        shareRate,
      },
    });
  } catch (error) {
    console.error("GET admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll");

    if (clearAll === "true") {
      await prisma.dailyStat.deleteMany({});
      return NextResponse.json({ success: true, message: "All daily stats cleared" });
    }

    if (!id) {
      return NextResponse.json({ error: "Stat ID is required" }, { status: 400 });
    }

    await prisma.dailyStat.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: "Stat entry deleted" });
  } catch (error) {
    console.error("DELETE admin stat error:", error);
    return NextResponse.json({ error: "Failed to delete stat entry" }, { status: 500 });
  }
}
