export interface ParsedUserAgent {
  browser: string;
  os: string;
  device: "Mobile" | "Tablet" | "Desktop" | "Bot" | "Unknown";
  formatted: string;
}

/**
 * Parses raw User-Agent string into human-readable browser, version, OS, and device information.
 */
export function parseUserAgent(ua?: string | null): ParsedUserAgent {
  if (!ua || ua.trim() === "" || ua === "Unknown User Agent") {
    return {
      browser: "Unknown Browser",
      os: "Unknown OS",
      device: "Unknown",
      formatted: "Unknown Device",
    };
  }

  const userAgent = ua.trim();

  // 1. Detect Bots & Crawlers
  if (/bot|crawler|spider|googlebot|bingbot|slurp|duckduckbot|baidu|yandex/i.test(userAgent)) {
    let botName = "Search Bot";
    if (/googlebot/i.test(userAgent)) botName = "Googlebot";
    else if (/bingbot/i.test(userAgent)) botName = "Bingbot";
    else if (/duckduckbot/i.test(userAgent)) botName = "DuckDuckBot";
    else if (/yandex/i.test(userAgent)) botName = "YandexBot";

    return {
      browser: botName,
      os: "Bot",
      device: "Bot",
      formatted: `${botName} (Bot)`,
    };
  }

  // 2. Detect OS & Device Type
  let os = "Unknown OS";
  let device: "Mobile" | "Tablet" | "Desktop" | "Unknown" = "Desktop";

  if (/iPad/i.test(userAgent)) {
    os = "iPadOS";
    device = "Tablet";
  } else if (/iPhone|iPod/i.test(userAgent)) {
    os = "iOS";
    device = "Mobile";
  } else if (/Android/i.test(userAgent)) {
    os = "Android";
    device = /Mobile/i.test(userAgent) ? "Mobile" : "Tablet";
  } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
    os = "macOS";
    device = "Desktop";
  } else if (/Windows NT/i.test(userAgent)) {
    os = "Windows";
    device = "Desktop";
  } else if (/CrOS/i.test(userAgent)) {
    os = "ChromeOS";
    device = "Desktop";
  } else if (/Linux/i.test(userAgent)) {
    os = "Linux";
    device = "Desktop";
  }

  // 3. Detect Browser Name & Version (order matters for user agent strings)
  let browser = "Unknown Browser";
  let version = "";

  let match: RegExpMatchArray | null = null;

  if ((match = userAgent.match(/(?:Edg|EdgA|EdgiOS)\/([0-9]+)/i))) {
    browser = "Edge";
    version = match[1];
  } else if ((match = userAgent.match(/(?:OPR|Opera)\/([0-9]+)/i))) {
    browser = "Opera";
    version = match[1];
  } else if ((match = userAgent.match(/SamsungBrowser\/([0-9]+)/i))) {
    browser = "Samsung Internet";
    version = match[1];
  } else if ((match = userAgent.match(/(?:Firefox|FxiOS)\/([0-9]+)/i))) {
    browser = "Firefox";
    version = match[1];
  } else if ((match = userAgent.match(/DuckDuckGo\/([0-9]+)/i))) {
    browser = "DuckDuckGo";
    version = match[1];
  } else if ((match = userAgent.match(/(?:Chrome|CriOS)\/([0-9]+)/i))) {
    browser = "Chrome";
    version = match[1];
  } else if ((match = userAgent.match(/Version\/([0-9]+).+Safari/i))) {
    browser = "Safari";
    version = match[1];
  } else if (userAgent.includes("Safari") && (match = userAgent.match(/Safari\/([0-9]+)/i))) {
    browser = "Safari";
    version = match[1];
  } else if ((match = userAgent.match(/(?:MSIE |rv:)([0-9]+)/i))) {
    browser = "Internet Explorer";
    version = match[1];
  } else if (userAgent.startsWith("Mozilla/") || userAgent.startsWith("Mozilla")) {
    browser = "Web Browser";
  }

  const browserWithVer = version ? `${browser} ${version}` : browser;
  const formatted = `${browserWithVer} • ${os}`;

  return {
    browser: browserWithVer,
    os,
    device,
    formatted,
  };
}
