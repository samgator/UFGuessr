import { NextRequest, NextResponse } from "next/server";
import { prisma, serializeQueueItem } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize Admin
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch all active (approved) locations that are NOT already in the daily queue
    const unqueuedLocations = await prisma.location.findMany({
      where: {
        approved: true,
        dailyQueues: {
          none: {},
        },
      },
    });

    if (unqueuedLocations.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active locations available to append. All active locations are already scheduled in the queue.",
        count: 0,
      });
    }

    // 3. Find the latest scheduled date in the daily queue
    const latestQueueItem = await prisma.dailyQueue.findFirst({
      orderBy: {
        scheduledDate: "desc",
      },
    });

    // 4. Calculate starting date for appending
    let startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0); // Start with today at midnight UTC

    if (latestQueueItem) {
      // If there is already a scheduled item, start appending on the next day
      startDate = new Date(latestQueueItem.scheduledDate);
      startDate.setUTCDate(startDate.getUTCDate() + 1);
    }

    // 5. Append locations sequentially
    const initialStartDate = new Date(startDate);
    const newlyScheduled = [];
    for (const loc of unqueuedLocations) {
      const scheduledDate = new Date(startDate);
      
      const item = await prisma.dailyQueue.create({
        data: {
          locationId: loc.id,
          scheduledDate,
        },
        include: {
          location: true,
        },
      });

      newlyScheduled.push(serializeQueueItem(item));
      
      // Move to the next calendar day
      startDate.setUTCDate(startDate.getUTCDate() + 1);
    }

    const firstDateStr = initialStartDate.toISOString().split('T')[0];

    return NextResponse.json({
      success: true,
      message: `Successfully appended ${unqueuedLocations.length} locations to the daily queue starting from ${firstDateStr}.`,
      count: unqueuedLocations.length,
      queueItems: newlyScheduled,
    });
  } catch (error) {
    console.error("POST append queue error:", error);
    return NextResponse.json({ error: "Failed to append locations to daily queue" }, { status: 500 });
  }
}
