import { ImageResponse } from "next/og";

export const alt = "Learn Agent Architecture — Anthropic Certification Prep";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FFFAF8",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background warm glow blobs */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            backgroundColor: "#FDDDD2",
            opacity: 0.5,
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            backgroundColor: "#FEF3C7",
            opacity: 0.6,
            filter: "blur(60px)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            padding: "56px 64px",
            position: "relative",
          }}
        >
          {/* Top row: badge + domain pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                backgroundColor: "#E8572E",
                borderRadius: "8px",
                padding: "8px 20px",
                fontSize: "15px",
                color: "white",
                fontWeight: 700,
                letterSpacing: "0.01em",
              }}
            >
              Anthropic Certification Prep
            </div>
            <div
              style={{
                backgroundColor: "#FEF0EC",
                border: "1.5px solid #F8907A",
                borderRadius: "8px",
                padding: "8px 18px",
                fontSize: "15px",
                color: "#B84828",
                fontWeight: 600,
              }}
            >
              Community Forum
            </div>
            <div
              style={{
                backgroundColor: "#FFFBEB",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
                padding: "8px 18px",
                fontSize: "15px",
                color: "#B45309",
                fontWeight: 600,
              }}
            >
              AI-Powered Study
            </div>
          </div>

          {/* Main heading */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                fontSize: "78px",
                fontWeight: 800,
                color: "#3D1509",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              Learn Agent
            </div>
            <div
              style={{
                fontSize: "78px",
                fontWeight: 800,
                color: "#E8572E",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              Architecture
            </div>
            <div
              style={{
                fontSize: "22px",
                color: "#98584A",
                fontWeight: 400,
                marginTop: "12px",
                maxWidth: "620px",
                lineHeight: 1.4,
              }}
            >
              Master Claude API, Agent SDK, MCP & Claude Code — and prepare
              for the most prestigious AI certification in the field.
            </div>
          </div>

          {/* Bottom row: stats + url */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Stat cards */}
            {[
              { value: "8", label: "Domains" },
              { value: "58+", label: "Questions" },
              { value: "AI", label: "Q&A Chat" },
              { value: "Forum", label: "Community" },
              { value: "Free", label: "To Start" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: "#FAF4F1",
                  border: "1.5px solid #E8D5D0",
                  borderRadius: "12px",
                  padding: "14px 22px",
                  gap: "2px",
                }}
              >
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: 700,
                    color: "#D85A30",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#B07868",
                    fontWeight: 500,
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}

            {/* Spacer + domain chips */}
            <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <div style={{ fontSize: "13px", color: "#C49890", fontWeight: 500 }}>
                learnagentarchitecture.com
              </div>
              <div style={{ fontSize: "12px", color: "#D8BAB5", fontWeight: 400 }}>
                More AI certification tracks coming soon
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
