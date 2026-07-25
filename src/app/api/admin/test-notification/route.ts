import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { sendNtfyNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const customTopic = body.topic as string | undefined;

    const origin = req.headers.get("origin") || req.nextUrl?.origin || "http://localhost:3000";

    const result = await sendNtfyNotification({
      title: "🧪 UFGuessr Test Notification",
      message: "Success! Your phone is configured to receive push notifications when users submit new campus locations.",
      clickUrl: `${origin}/admin`,
      tags: ["white_check_mark", "bell", "university"],
      priority: 4,
      topic: customTopic,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to send notification" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Test push notification sent successfully!" });
  } catch (error: unknown) {
    console.error("POST test-notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
