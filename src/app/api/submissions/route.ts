import { NextRequest, NextResponse } from "next/server";
import { prisma, serializeLocation } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name")?.toString();
    const latitudeStr = formData.get("latitude")?.toString();
    const longitudeStr = formData.get("longitude")?.toString();
    const difficulty = formData.get("difficulty")?.toString();
    const uploader = formData.get("uploader")?.toString() || "Anonymous";
    const imageFile = formData.get("image") as File | null;

    if (!name || !latitudeStr || !longitudeStr || !difficulty || !imageFile) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const latitude = parseFloat(latitudeStr);
    const longitude = parseFloat(longitudeStr);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: "Latitude and longitude must be valid numbers" }, { status: 400 });
    }

    // Validate image format & size
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image file exceeds maximum limit of 5MB" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "Invalid image format. Allowed: JPG, PNG, WEBP, GIF" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // Save as PENDING location
    const submission = await prisma.location.create({
      data: {
        name,
        latitude,
        longitude,
        imageUrl: buffer,
        difficulty,
        approved: false,
        uploader,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Landmark submitted successfully! It is now pending admin review.",
      submission: serializeLocation(submission),
    });
  } catch (error) {
    console.error("POST submissions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
