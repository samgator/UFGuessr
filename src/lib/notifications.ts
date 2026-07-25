import { prisma } from "./db";

export interface NtfyPayload {
  title?: string;
  message: string;
  clickUrl?: string;
  tags?: string[];
  priority?: number; // 1: min, 2: low, 3: default, 4: high, 5: max
  topic?: string;
  serverUrl?: string;
}

/**
 * Gets configured ntfy topic from process.env or Prisma DB settings
 */
export async function getNtfyConfig(): Promise<{ topic: string | null; serverUrl: string }> {
  let topic = process.env.NTFY_TOPIC || null;
  let serverUrl = process.env.NTFY_SERVER_URL || "https://ntfy.sh";

  try {
    if (!topic) {
      const topicSetting = await prisma.settings.findUnique({
        where: { key: "ntfy_topic" },
      });
      if (topicSetting?.value) {
        topic = topicSetting.value;
      }
    }

    const serverSetting = await prisma.settings.findUnique({
      where: { key: "ntfy_server_url" },
    });
    if (serverSetting?.value) {
      serverUrl = serverSetting.value;
    }
  } catch (error) {
    console.error("Error fetching ntfy settings from DB:", error);
  }

  // Sanitize serverUrl (remove trailing slashes)
  serverUrl = serverUrl.replace(/\/+$/, "");

  return { topic, serverUrl };
}

/**
 * Sends a push notification via ntfy.sh (or self-hosted ntfy server)
 */
export async function sendNtfyNotification(payload: NtfyPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getNtfyConfig();
    const targetTopic = payload.topic || config.topic;
    const targetServerUrl = (payload.serverUrl || config.serverUrl).replace(/\/+$/, "");

    if (!targetTopic) {
      console.log("[Notifications] Skipped: No ntfy topic configured.");
      return { success: false, error: "No ntfy topic configured" };
    }

    const ntfyBody = {
      topic: targetTopic,
      title: payload.title || "📍 UFGuessr Alert",
      message: payload.message,
      priority: payload.priority || 4, // High priority by default
      tags: payload.tags || ["round_pushpin", "camera"],
      click: payload.clickUrl,
      actions: payload.clickUrl
        ? [
            {
              action: "view",
              label: "Review in Admin",
              url: payload.clickUrl,
            },
          ]
        : undefined,
    };

    const response = await fetch(`${targetServerUrl}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ntfyBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Notifications] ntfy push error (${response.status}):`, errText);
      return { success: false, error: `ntfy returned status ${response.status}: ${errText}` };
    }

    console.log(`[Notifications] Successfully sent ntfy notification to topic "${targetTopic}"`);
    return { success: true };
  } catch (error: unknown) {
    console.error("[Notifications] Exception sending ntfy push:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMsg };
  }
}

/**
 * Formats and triggers a phone notification when a user submits a landmark location
 */
export async function notifyNewLocationSubmission(
  submission: {
    id: number;
    name: string;
    uploader?: string | null;
    difficulty: string;
    latitude: number;
    longitude: number;
  },
  requestOrigin?: string
) {
  const baseUrl = requestOrigin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const adminUrl = `${baseUrl.replace(/\/+$/, "")}/admin`;

  const title = `📍 New Location Submitted: ${submission.name}`;
  const message =
    `A community landmark was just submitted for review!\n\n` +
    `• Landmark: ${submission.name}\n` +
    `• Submitted By: ${submission.uploader || "Anonymous"}\n` +
    `• Difficulty: ${submission.difficulty.toUpperCase()}\n` +
    `• Coordinates: (${submission.latitude.toFixed(4)}, ${submission.longitude.toFixed(4)})\n\n` +
    `Tap to open Admin Console & review.`;

  return await sendNtfyNotification({
    title,
    message,
    clickUrl: adminUrl,
    tags: ["round_pushpin", "camera", "university"],
    priority: 4,
  });
}
