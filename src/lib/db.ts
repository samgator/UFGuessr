import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export interface DbLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: Uint8Array | Buffer | string;
  difficulty: string;
  approved: boolean;
  archived: boolean;
  uploader: string | null;
  createdAt: Date;
}

export interface SerializedLocation extends Omit<DbLocation, "imageUrl"> {
  imageUrl: string;
}

export interface DbQueueItem {
  id: number;
  locationId: number;
  scheduledDate: Date;
  createdAt: Date;
  location?: DbLocation | null;
}

export interface SerializedQueueItem extends Omit<DbQueueItem, "location"> {
  location?: SerializedLocation | null;
}

export function serializeLocation(location: DbLocation | null | undefined): SerializedLocation | null {
  if (!location) return null;
  return {
    ...location,
    imageUrl: `/api/locations/${location.id}/image`,
  };
}

export function serializeQueueItem(queueItem: DbQueueItem | null | undefined): SerializedQueueItem | null {
  if (!queueItem) return null;
  return {
    ...queueItem,
    location: serializeLocation(queueItem.location),
  };
}

export async function archivePastDailyLocations() {
  try {
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

    const etDateStr = `${year}-${month}-${day}`;
    const todayDate = new Date(etDateStr);
    todayDate.setUTCHours(0, 0, 0, 0); // Midnight UTC of the current Eastern Time day

    // Mark any location that was in a daily queue with scheduledDate < todayDate as archived
    await prisma.location.updateMany({
      where: {
        archived: false,
        dailyQueues: {
          some: {
            scheduledDate: {
              lt: todayDate,
            },
          },
        },
      },
      data: {
        archived: true,
      },
    });
  } catch (error) {
    console.error("Failed to dynamically archive past daily locations:", error);
  }
}
