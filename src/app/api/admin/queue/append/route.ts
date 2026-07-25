import { NextRequest, NextResponse } from "next/server";
import { prisma, serializeQueueItem, archivePastDailyLocations, getTodayETDate } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize Admin
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Clean up past daily locations and remove previous locations from the queue
    await archivePastDailyLocations();

    // 3. Fetch all active (approved AND non-archived) locations that are NOT already in the daily queue
    const unqueuedLocations = await prisma.location.findMany({
      where: {
        approved: true,
        archived: false,
        dailyQueues: {
          none: {},
        },
      },
    });

    if (unqueuedLocations.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active locations available to append. All active non-archived locations are already scheduled in the queue.",
        count: 0,
      });
    }

    // 4. Find the latest scheduled date in the daily queue
    const latestQueueItem = await prisma.dailyQueue.findFirst({
      orderBy: {
        scheduledDate: "desc",
      },
    });

    // 5. Calculate starting date for appending
    const today = getTodayETDate();
    let startDate = new Date(today);

    if (latestQueueItem) {
      // If there is already a scheduled item, start appending on the next day after the latest scheduled item
      const nextDate = new Date(latestQueueItem.scheduledDate);
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);
      if (nextDate > startDate) {
        startDate = nextDate;
      }
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
