import { NextRequest, NextResponse } from "next/server";
import { prisma, serializeLocation } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
      location: serializeLocation(updatedLocation),
    });
  } catch (error) {
    console.error("PATCH approve submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Reject a pending landmark and delete from DB
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
