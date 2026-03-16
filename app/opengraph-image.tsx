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
          backgroundColor: "#0a0a0f",
          padding: "64px",
        }}
      >
        {/* Top badge row */}
        <div style={{ display: "flex", gap: "12px" }}>
          <div
            style={{
              backgroundColor: "#7c3aed",
              borderRadius: "8px",
              padding: "8px 18px",
              fontSize: "15px",
              color: "white",
              fontWeight: 700,
            }}
          >
            Anthropic Certification Prep
          </div>
          <div
            style={{
              backgroundColor: "#1e1b2e",
              border: "1px solid #4c1d95",
              borderRadius: "8px",
              padding: "8px 18px",
              fontSize: "15px",
              color: "#a78bfa",
              fontWeight: 600,
            }}
          >
            AI-Powered Study Guide
          </div>
        </div>

        {/* Main heading */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.0,
              letterSpacing: "-2px",
            }}
          >
            Learn Agent
          </div>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 800,
              color: "#a78bfa",
              lineHeight: 1.0,
              letterSpacing: "-2px",
            }}
          >
            Architecture
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              fontWeight: 400,
              lineHeight: 1.4,
              marginTop: "8px",
            }}
          >
            Master Claude API, Agent SDK, MCP &amp; Claude Code — with AI explanations and practice exams.
          </div>
        </div>

        {/* Bottom stats + URL */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {[
            { value: "8", label: "Domains" },
            { value: "58+", label: "Questions" },
            { value: "AI", label: "Q&A Chat" },
            { value: "Free", label: "To Start" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#13131f",
                border: "1px solid #1e1b2e",
                borderRadius: "12px",
                padding: "16px 28px",
                gap: "4px",
              }}
            >
              <div style={{ fontSize: "30px", fontWeight: 800, color: "#a78bfa" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
          <div
            style={{
              marginLeft: "auto",
              fontSize: "18px",
              color: "#334155",
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
