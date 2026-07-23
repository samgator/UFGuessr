import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Helper to delete local image file if it exists
async function deleteLocalImage(imageUrl: string) {
  if (imageUrl.startsWith("/api/uploads/") || imageUrl.startsWith("/uploads/")) {
    const filename = imageUrl.replace("/api/uploads/", "").replace("/uploads/", "");
    const filePath = path.join(process.cwd(), "uploads", filename);
    const oldFilePathInPublic = path.join(process.cwd(), "public", "uploads", filename);
    try {
      await fs.unlink(filePath);
      console.log(`Deleted local submission image file: ${filePath}`);
    } catch {
      // Ignore if not found
    }
    try {
      await fs.unlink(oldFilePathInPublic);
      console.log(`Deleted legacy submission image file: ${oldFilePathInPublic}`);
    } catch {
      // Ignore if not found
    }
  }
}

// PATCH: Approve a pending landmark
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid location ID" }, { status: 400 });
    }

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: { approved: true },
    });

    return NextResponse.json({
      success: true,
      message: "Landmark approved successfully!",
      location: updatedLocation,
    });
  } catch (error) {
    console.error("PATCH approve submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Reject a pending landmark and unlink file
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
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
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Delete image file first
    await deleteLocalImage(location.imageUrl);

    // Delete record from DB
    await prisma.location.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Submission rejected and deleted successfully!",
    });
  } catch (error) {
    console.error("DELETE reject submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
