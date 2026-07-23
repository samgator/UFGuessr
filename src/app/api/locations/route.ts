import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

// Support file uploads up to 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(locations);
  } catch (error) {
    console.error("GET locations error:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize Admin
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    // Centered around 29.6436, -82.3549. Bounding box coordinates:
    if (latitude < 29.60 || latitude > 29.68 || longitude < -82.40 || longitude > -82.30) {
      return NextResponse.json(
        { error: "Coordinates must be within the greater UF Campus region (Lat: 29.60 to 29.68, Lng: -82.40 to -82.30)" },
        { status: 400 }
      );
    }

    let imageUrl = "";

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

      imageUrl = `/api/uploads/${uniqueFilename}`;
    } else if (externalImageUrl) {
      imageUrl = externalImageUrl;
    } else {
      return NextResponse.json({ error: "An image file or external image URL is required" }, { status: 400 });
    }

    // 4. Create Location in Database
    const newLocation = await prisma.location.create({
      data: {
        name,
        latitude,
        longitude,
        imageUrl,
        difficulty,
      },
    });

    return NextResponse.json(newLocation, { status: 201 });
  } catch (error) {
    console.error("Create location error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
