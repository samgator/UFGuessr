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
          backgroundImage: "radial-gradient(circle at 50% 0%, #1e293b 0%, #0b1329 70%)",
          padding: "50px 60px",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Decorative Gator-orange and blue glow accents */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "rgba(37, 99, 235, 0.25)",
            filter: "blur(60px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "rgba(249, 115, 22, 0.25)",
            filter: "blur(60px)",
            display: "flex",
          }}
        />

        {/* Top Header: Logo & Branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Logo Badge */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #2563eb, #f97316)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px rgba(37, 99, 235, 0.4)",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: 900,
                  letterSpacing: "-1px",
                  color: "#ffffff",
                }}
              >
                UFGuessr
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#38bdf8",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                UF Campus Exploration
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: "16px",
              fontWeight: 800,
              color: "#fb923c",
              letterSpacing: "0.5px",
            }}
          >
            <span>🐊 DAILY CHALLENGE</span>
            {dateStr && <span style={{ color: "#94a3b8" }}>• {dateStr}</span>}
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
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
            {[1, 2, 3, 4, 5].map((starIndex) => (
              <svg
                key={starIndex}
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill={starIndex <= stars ? "#eab308" : "rgba(255, 255, 255, 0.1)"}
                stroke={starIndex <= stars ? "#ca8a04" : "rgba(255, 255, 255, 0.2)"}
                strokeWidth="1.5"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>

          {/* Stats Box Container */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              width: "100%",
            }}
          >
            {/* Score Card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "28px 48px",
                borderRadius: "24px",
                backgroundColor: "rgba(15, 23, 42, 0.75)",
                border: "1.5px solid rgba(234, 179, 8, 0.3)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                minWidth: "320px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "6px",
                }}
              >
                SCORE EARNED
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "56px",
                    fontWeight: 900,
                    color: "#facc15",
                    lineHeight: 1,
                  }}
                >
                  {score.toLocaleString()}
                </span>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#64748b" }}>
                  / 5,000 pts
                </span>
              </div>
            </div>

            {/* Distance Off Card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "28px 48px",
                borderRadius: "24px",
                backgroundColor: "rgba(15, 23, 42, 0.75)",
                border: "1.5px solid rgba(56, 189, 248, 0.3)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                minWidth: "320px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "6px",
                }}
              >
                DISTANCE OFF
              </span>
              <span
                style={{
                  fontSize: "56px",
                  fontWeight: 900,
                  color: "#38bdf8",
                  lineHeight: 1,
                }}
              >
                {distanceStr}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Footer CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            width: "100%",
            padding: "16px 32px",
            borderRadius: "16px",
            backgroundColor: "rgba(37, 99, 235, 0.15)",
            border: "1px solid rgba(37, 99, 235, 0.3)",
            zIndex: 10,
          }}
        >
          <span style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>
            Can you beat this score?
          </span>
          <span style={{ fontSize: "20px", fontWeight: 800, color: "#fb923c" }}>
            Play today&apos;s challenge at ufguessr.com
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
