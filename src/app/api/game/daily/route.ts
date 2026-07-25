import { NextResponse } from "next/server";
import { prisma, serializeLocation, archivePastDailyLocations, getTodayETDate } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Archive past daily locations and remove previous locations from the queue
    await archivePastDailyLocations();

    // 2. Check "Under Construction" state from DB settings
    const underConstructionSetting = await prisma.settings.findUnique({
      where: { key: "daily_under_construction" },
    });

    const isUnderConstruction = underConstructionSetting?.value === "true";

    // 3. Return under construction state if enabled
    if (isUnderConstruction) {
      return NextResponse.json({
        underConstruction: true,
      });
    }

    // 4. Resolve target Eastern Time date
    const targetDate = getTodayETDate();
    const etDateStr = targetDate.toISOString().split("T")[0];

    // 4. Find the scheduled queue item
    let queueItem = await prisma.dailyQueue.findFirst({
      where: {
        scheduledDate: {
          equals: targetDate,
        },
      },
      include: {
        location: true,
      },
    });

    // Defensive fallback: if nothing is scheduled for today, pick a fallback location to ensure app is playable
    let isFallback = false;
    if (!queueItem) {
      // Pick the first location in database
      const fallbackLoc = await prisma.location.findFirst();
      if (!fallbackLoc) {
        return NextResponse.json({
          underConstruction: false,
          error: "No locations loaded in database.",
        }, { status: 404 });
      }

      queueItem = {
        id: -1,
        locationId: fallbackLoc.id,
        scheduledDate: targetDate,
        createdAt: new Date(),
        location: fallbackLoc,
      };
      isFallback = true;
    }

    return NextResponse.json({
      success: true,
      underConstruction: false,
      date: etDateStr,
      location: serializeLocation(queueItem.location),
      isFallback,
    });
  } catch (error) {
    console.error("GET daily game error:", error);
    return NextResponse.json({ error: "Failed to load daily game" }, { status: 500 });
  }
}
