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
