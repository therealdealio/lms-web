import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Learn Agent Architecture — Anthropic Certification Prep";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0d0d18 100%)",
          padding: "64px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Top: badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              borderRadius: "8px",
              padding: "6px 16px",
              fontSize: "14px",
              color: "white",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Anthropic Certification
          </div>
          <div
            style={{
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: "8px",
              padding: "6px 16px",
              fontSize: "14px",
              color: "#a78bfa",
              fontWeight: 600,
            }}
          >
            AI-Powered Study Guide
          </div>
        </div>

        {/* Center: main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Learn Agent{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Architecture
            </span>
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: "700px",
            }}
          >
            Master Claude API, Agent SDK, MCP & Claude Code — with instant AI
            explanations and practice exams.
          </div>
        </div>

        {/* Bottom: stats row */}
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          {[
            { value: "8", label: "Domains" },
            { value: "58+", label: "Practice Questions" },
            { value: "AI", label: "Q&A Assistant" },
            { value: "$0", label: "Free to Start" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "16px 24px",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "#a78bfa",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}

          {/* URL */}
          <div
            style={{
              marginLeft: "auto",
              fontSize: "18px",
              color: "#475569",
              fontWeight: 500,
            }}
          >
            learnagentarchitecture.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
