import { NextRequest, NextResponse } from "next/server";
import { prisma, serializeLocation } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid location ID" }, { status: 400 });
    }

    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    return NextResponse.json(serializeLocation(location));
  } catch (error) {
    console.error("GET single location error:", error);
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. Authorize Admin
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid location ID" }, { status: 400 });
    }

    const existingLocation = await prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // 2. Parse Form Data
    const formData = await req.formData();
    const name = formData.get("name")?.toString();
    const latitudeStr = formData.get("latitude")?.toString();
    const longitudeStr = formData.get("longitude")?.toString();
    const difficulty = formData.get("difficulty")?.toString();
    const uploader = formData.get("uploader")?.toString();
    const imageFile = formData.get("image") as File | null;
    const externalImageUrl = formData.get("externalImageUrl")?.toString();

    // 3. Validation
    if (!name || !latitudeStr || !longitudeStr || !difficulty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const latitude = parseFloat(latitudeStr);
    const longitude = parseFloat(longitudeStr);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: "Latitude and longitude must be valid numbers" }, { status: 400 });
    }

    // UF Bound verification (defensive check)
    if (latitude < 29.60 || latitude > 29.68 || longitude < -82.40 || longitude > -82.30) {
      return NextResponse.json(
        { error: "Coordinates must be within the greater UF Campus region (Lat: 29.60 to 29.68, Lng: -82.40 to -82.30)" },
        { status: 400 }
      );
    }

    const dataToUpdate: {
      name: string;
      latitude: number;
      longitude: number;
      difficulty: string;
      uploader?: string;
      imageUrl?: Buffer;
    } = {
      name,
      latitude,
      longitude,
      difficulty,
    };

    if (uploader !== undefined) {
      dataToUpdate.uploader = uploader || "Anonymous";
    }

    if (imageFile && imageFile.name) {
      // Validate File Size
      if (imageFile.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Image file exceeds maximum limit of 5MB" }, { status: 400 });
      }

      // Validate File Type
      if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
        return NextResponse.json(
          { error: "Invalid image format. Allowed: JPG, PNG, WEBP, GIF" },
          { status: 400 }
        );
      }

      // Save File Bytes
      dataToUpdate.imageUrl = Buffer.from(await imageFile.arrayBuffer());
    } else if (externalImageUrl) {
      try {
        const response = await fetch(externalImageUrl);
        if (!response.ok) {
          return NextResponse.json({ error: "Failed to fetch external image from URL" }, { status: 400 });
        }
        dataToUpdate.imageUrl = Buffer.from(await response.arrayBuffer());
      } catch (err) {
        console.error("External image fetch error:", err);
        return NextResponse.json({ error: "Invalid external image URL or network error" }, { status: 400 });
      }
    }

    // 4. Update Database
    const updatedLocation = await prisma.location.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(serializeLocation(updatedLocation));
  } catch (error) {
    console.error("Update location error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. Authorize Admin
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid location ID" }, { status: 400 });
    }

    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // Delete DB Record (DailyQueue items will be cascading deleted!)
    await prisma.location.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Location deleted successfully" });
  } catch (error) {
    console.error("Delete location error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
