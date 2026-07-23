import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;
  
  // Try new uploads location first, then fallback to old public/uploads
  const filePath = path.join(process.cwd(), "uploads", filename);
  const fallbackPath = path.join(process.cwd(), "public", "uploads", filename);

  try {
    let fileBuffer;
    try {
      fileBuffer = await fs.readFile(filePath);
    } catch {
      fileBuffer = await fs.readFile(fallbackPath);
    }
    
    // Guess MIME type based on file extension
    let mimeType = "image/jpeg";
    const ext = filename.toLowerCase();
    if (ext.endsWith(".png")) mimeType = "image/png";
    else if (ext.endsWith(".webp")) mimeType = "image/webp";
    else if (ext.endsWith(".gif")) mimeType = "image/gif";
    else if (ext.endsWith(".svg")) mimeType = "image/svg+xml";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("GET dynamic upload error:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
