import { NextRequest, NextResponse } from "next/server";
import { prisma, serializeQueueItem } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    // Return all scheduled queue entries, sorted by scheduledDate
    const queue = await prisma.dailyQueue.findMany({
      include: {
        location: true,
      },
      orderBy: {
        scheduledDate: "asc",
      },
    });
    return NextResponse.json(queue.map(serializeQueueItem));
  } catch (error) {
    console.error("GET queue error:", error);
    return NextResponse.json({ error: "Failed to fetch daily queue" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize Admin
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { locationId, scheduledDateStr } = await req.json();

    if (!locationId || !scheduledDateStr) {
      return NextResponse.json({ error: "locationId and scheduledDateStr are required" }, { status: 400 });
    }

    const targetDate = new Date(scheduledDateStr);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: "Invalid scheduledDateStr format" }, { status: 400 });
    }

    // Set time to exact midnight of that date to ensure consistency
    targetDate.setUTCHours(0, 0, 0, 0);

    // Verify location exists
    const location = await prisma.location.findUnique({
      where: { id: Number(locationId) },
    });

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // Upsert the queue slot
    const queueItem = await prisma.dailyQueue.upsert({
      where: {
        scheduledDate: targetDate,
      },
      update: {
        locationId: Number(locationId),
      },
      create: {
        locationId: Number(locationId),
        scheduledDate: targetDate,
      },
      include: {
        location: true,
      },
    });

    return NextResponse.json({ success: true, queueItem: serializeQueueItem(queueItem) });
  } catch (error) {
    console.error("POST queue error:", error);
    return NextResponse.json({ error: "Failed to schedule queue slot" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Authorize Admin
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Queue item ID is required" }, { status: 400 });
    }

    await prisma.dailyQueue.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: "Queue item removed successfully" });
  } catch (error) {
    console.error("DELETE queue error:", error);
    return NextResponse.json({ error: "Failed to delete queue item" }, { status: 500 });
  }
}
