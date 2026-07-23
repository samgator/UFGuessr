import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Utility to delete local image file if it exists
async function deleteLocalImage(imageUrl: string) {
  if (imageUrl.startsWith("/api/uploads/") || imageUrl.startsWith("/uploads/")) {
    const filename = imageUrl.replace("/api/uploads/", "").replace("/uploads/", "");
    const filePath = path.join(process.cwd(), "uploads", filename);
    const oldFilePathInPublic = path.join(process.cwd(), "public", "uploads", filename);
    try {
      await fs.unlink(filePath);
      console.log(`Deleted local image file: ${filePath}`);
    } catch {
      // Ignore if not found
    }
    try {
      await fs.unlink(oldFilePathInPublic);
      console.log(`Deleted legacy image file: ${oldFilePathInPublic}`);
    } catch {
      // Ignore if not found
    }
  }
}

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

    return NextResponse.json(location);
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

    let imageUrl = existingLocation.imageUrl;

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

      // Sanitize Filename
      const fileExt = path.extname(imageFile.name).toLowerCase() || ".jpg";
      const cleanName = name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      const uniqueFilename = `${cleanName}_${Date.now()}${fileExt}`;

      // Ensure upload directory exists
      const uploadDir = path.join(process.cwd(), "uploads");
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      // Save File
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const filePath = path.join(uploadDir, uniqueFilename);
      await fs.writeFile(filePath, buffer);

      // Clean up old image if it was local
      await deleteLocalImage(existingLocation.imageUrl);

      imageUrl = `/api/uploads/${uniqueFilename}`;
    } else if (externalImageUrl) {
      // If updating to an external URL, clean up old local image if applicable
      if (externalImageUrl !== existingLocation.imageUrl) {
        await deleteLocalImage(existingLocation.imageUrl);
      }
      imageUrl = externalImageUrl;
    }

    // 4. Update Database
    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        name,
        latitude,
        longitude,
        imageUrl,
        difficulty,
      },
    });

    return NextResponse.json(updatedLocation);
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

    // Clean up local image file if present
    await deleteLocalImage(location.imageUrl);

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
