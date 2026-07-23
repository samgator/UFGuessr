import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function getMimeType(buffer: Buffer): string {
  if (buffer.length > 4) {
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return "image/png";
    }
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return "image/jpeg";
    }
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
      return "image/gif";
    }
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      return "image/webp";
    }
    // Check if SVG format
    const startStr = buffer.toString("utf-8", 0, Math.min(buffer.length, 100)).trim().toLowerCase();
    if (startStr.startsWith("<svg") || startStr.includes("xmlns=\"http://www.w3.org/2000/svg\"") || startStr.includes("<svg")) {
      return "image/svg+xml";
    }
  }
  return "image/jpeg"; // fallback
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid location ID" }, { status: 400 });
    }

    const location = await prisma.location.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!location || !location.imageUrl) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const buffer = Buffer.from(location.imageUrl);
    const mimeType = getMimeType(buffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("GET location image error:", error);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
