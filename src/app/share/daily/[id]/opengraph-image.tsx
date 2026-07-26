import React from "react";
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export const alt = "UFGuessr Daily Challenge Result";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Load Inter ExtraBold & Bold fonts for crisp, exact website typography
async function loadGoogleFont(font: string, weight: number) {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&text=UFGuessr0123456789%2C.km%20pts/DAILYCHALLENGECanyoubeatthisscore%3FOffTargetScoreEarnedDistanceLocation`;
  const css = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  }).then((res) => res.text());

  const fontUrl = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];

  if (!fontUrl) {
    throw new Error("Failed to parse font URL");
  }

  return fetch(fontUrl).then((res) => res.arrayBuffer());
}

export default async function Image({ params }: { params: { id: string } }) {
  const statId = parseInt(params.id, 10);

  let score = 0;
  let distanceStr = "0m";
  let dateStr = "";
  let stars = 5;

  if (!isNaN(statId)) {
    try {
      const stat = await prisma.dailyStat.findUnique({
        where: { id: statId },
      });

      if (stat) {
        score = stat.score;
        const dist = stat.distance;
        distanceStr = dist < 1000 ? `${Math.round(dist)}m` : `${(dist / 1000).toFixed(2)}km`;
        dateStr = stat.date;

        if (score >= 4800) stars = 5;
        else if (score >= 4000) stars = 4;
        else if (score >= 2800) stars = 3;
        else if (score >= 1500) stars = 2;
        else stars = 1;
      }
    } catch (e) {
      console.error("Failed to load dailyStat for OG image:", e);
    }
  }

  // Fetch fonts safely with fallback
  let fontData: ArrayBuffer | null = null;
  try {
    fontData = await loadGoogleFont("Inter", 900);
  } catch (e) {
    console.error("Font loading error:", e);
  }

  const fontOption = fontData
    ? [
        {
          name: "Inter",
          data: fontData,
          style: "normal" as const,
          weight: 900 as const,
        },
      ]
    : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#0b1329",
          backgroundImage: "radial-gradient(circle at 50% -20%, #1d2846 0%, #0b1329 80%)",
          padding: "52px 64px",
          color: "white",
          fontFamily: fontData ? "Inter, system-ui, sans-serif" : "system-ui, -apple-system, sans-serif",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Ambient Gator Blue & Orange Glowing Orbs */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(37, 99, 235, 0.35)",
            filter: "blur(70px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(249, 115, 22, 0.35)",
            filter: "blur(70px)",
            display: "flex",
          }}
        />

        {/* Top Header: Matching Navbar Logo & Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            {/* Logo Badge matching Homepage Navbar */}
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "18px",
                background: "linear-gradient(135deg, #2563eb 0%, #f97316 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px rgba(37, 99, 235, 0.45)",
              }}
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            
            {/* Brand Title with Website Gradient Text */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "44px",
                  fontWeight: 900,
                  letterSpacing: "-1.5px",
                  background: "linear-gradient(to right, #60a5fa, #3b82f6, #fb923c)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  lineHeight: 1,
                }}
              >
                UFGuessr
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#94a3b8",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                UF Campus Exploration
              </span>
            </div>
          </div>

          {/* Daily Challenge Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              borderRadius: "9999px",
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1.5px solid rgba(249, 115, 22, 0.4)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              fontSize: "17px",
              fontWeight: 900,
              color: "#fb923c",
              letterSpacing: "0.5px",
            }}
          >
            <span>🐊 DAILY CHALLENGE</span>
            {dateStr && <span style={{ color: "#94a3b8", fontWeight: 700 }}>• {dateStr}</span>}
          </div>
        </div>

        {/* Center Main Card Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            zIndex: 10,
          }}
        >
          {/* Star Rating display */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "22px" }}>
            {[1, 2, 3, 4, 5].map((starIndex) => (
              <svg
                key={starIndex}
                width="38"
                height="38"
                viewBox="0 0 24 24"
                fill={starIndex <= stars ? "#facc15" : "rgba(255, 255, 255, 0.08)"}
                stroke={starIndex <= stars ? "#eab308" : "rgba(255, 255, 255, 0.2)"}
                strokeWidth="1.75"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>

          {/* Stats Box Container matching Website Cards */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "28px",
              width: "100%",
            }}
          >
            {/* Score Card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "28px 52px",
                borderRadius: "28px",
                backgroundColor: "rgba(15, 23, 42, 0.85)",
                border: "2px solid rgba(234, 179, 8, 0.4)",
                boxShadow: "0 12px 35px rgba(0, 0, 0, 0.6)",
                minWidth: "340px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 900,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  marginBottom: "8px",
                }}
              >
                SCORE EARNED
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "64px",
                    fontWeight: 900,
                    color: "#facc15",
                    lineHeight: 1,
                    letterSpacing: "-2px",
                  }}
                >
                  {score.toLocaleString()}
                </span>
                <span style={{ fontSize: "22px", fontWeight: 800, color: "#64748b" }}>
                  / 5,000
                </span>
              </div>
            </div>

            {/* Distance Off Card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "28px 52px",
                borderRadius: "28px",
                backgroundColor: "rgba(15, 23, 42, 0.85)",
                border: "2px solid rgba(56, 189, 248, 0.4)",
                boxShadow: "0 12px 35px rgba(0, 0, 0, 0.6)",
                minWidth: "340px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 900,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  marginBottom: "8px",
                }}
              >
                DISTANCE OFF
              </span>
              <span
                style={{
                  fontSize: "64px",
                  fontWeight: 900,
                  color: "#38bdf8",
                  lineHeight: 1,
                  letterSpacing: "-2px",
                }}
              >
                {distanceStr}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Footer CTA Banner matching Homepage Buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            width: "100%",
            padding: "18px 36px",
            borderRadius: "20px",
            background: "linear-gradient(to right, rgba(37, 99, 235, 0.25), rgba(249, 115, 22, 0.25))",
            border: "1.5px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.4)",
            zIndex: 10,
          }}
        >
          <span style={{ fontSize: "22px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.5px" }}>
            Can you beat this score?
          </span>
          <span style={{ fontSize: "22px", fontWeight: 900, color: "#fb923c", letterSpacing: "-0.5px" }}>
            Play today at ufguessr.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontOption,
    }
  );
}
