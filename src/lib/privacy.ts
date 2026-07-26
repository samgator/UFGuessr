import { NextRequest } from "next/server";
import crypto from "crypto";

const PRIVACY_SALT = process.env.PRIVACY_SALT || "ufguessr_privacy_salt_2026";

/**
 * Extracts raw client IP address from request headers.
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

/**
 * Anonymizes an IPv4 or IPv6 address by masking identifying octets.
 * e.g., "192.168.1.150" -> "192.168.1.0"
 */
export function anonymizeIp(ip: string): string {
  if (!ip || ip.startsWith("anon_")) return ip;

  // Handle IPv4
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      parts[3] = "0";
      return parts.join(".");
    }
  }

  // Handle IPv6
  if (ip.includes(":")) {
    const parts = ip.split(":");
    if (parts.length > 3) {
      return `${parts.slice(0, 3).join(":")}::`;
    }
  }

  return ip;
}

/**
 * Anonymizes and hashes an IP address using SHA-256 with a salt.
 * Returns a uniform string like `anon_a1b2c3d4e5f67890`.
 */
export function hashIp(ip: string): string {
  if (!ip) return "anon_unknown";
  if (ip.startsWith("anon_")) return ip;

  const anonymized = anonymizeIp(ip);
  const hash = crypto
    .createHash("sha256")
    .update(`${anonymized}:${PRIVACY_SALT}`)
    .digest("hex")
    .substring(0, 16);

  return `anon_${hash}`;
}

/**
 * Convenience helper to extract and hash IP directly from a NextRequest.
 */
export function getHashedClientIp(req: NextRequest): string {
  const rawIp = getClientIp(req);
  return hashIp(rawIp);
}
