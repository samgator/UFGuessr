import { NextResponse } from "next/server";
import { prisma, serializeLocation } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch all active locations
    const allLocations = await prisma.location.findMany({
      where: { approved: true },
    });

    if (allLocations.length === 0) {
      return NextResponse.json(
        { error: "No locations found in the database. Please contact an admin." },
        { status: 404 }
      );
    }

    // 2. Shuffle locations
    const shuffled = [...allLocations].sort(() => 0.5 - Math.random());

    // 3. Draw 5 locations (or fewer if we have less than 5 total) and serialize them
    const gameLocations = shuffled.slice(0, Math.min(5, shuffled.length)).map(serializeLocation);

    return NextResponse.json({
      success: true,
      roundsCount: gameLocations.length,
      locations: gameLocations,
    });
  } catch (error) {
    console.error("GET archive game locations error:", error);
    return NextResponse.json({ error: "Failed to generate game locations" }, { status: 500 });
  }
}
