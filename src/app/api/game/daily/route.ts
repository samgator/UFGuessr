import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Helper to get Eastern Time date string in YYYY-MM-DD
function getEasternTimeDateString(): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  
  const parts = formatter.formatToParts(new Date());
  const year = parts.find(p => p.type === "year")?.value;
  const month = parts.find(p => p.type === "month")?.value;
  const day = parts.find(p => p.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export async function GET() {
  try {
    // 1. Check "Under Construction" state from DB settings
    const underConstructionSetting = await prisma.settings.findUnique({
      where: { key: "daily_under_construction" },
    });

    const isUnderConstruction = underConstructionSetting?.value === "true";

    // 2. Return under construction state if enabled
    if (isUnderConstruction) {
      return NextResponse.json({
        underConstruction: true,
      });
    }

    // 3. Resolve target Eastern Time date
    const etDateStr = getEasternTimeDateString(); // e.g. "2026-07-22"
    const targetDate = new Date(etDateStr);
    targetDate.setUTCHours(0, 0, 0, 0); // Midnight UTC of the ET day

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
      location: queueItem.location,
      isFallback,
    });
  } catch (error) {
    console.error("GET daily game error:", error);
    return NextResponse.json({ error: "Failed to load daily game" }, { status: 500 });
  }
}
