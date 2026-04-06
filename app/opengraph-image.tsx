import { ImageResponse } from "next/og";

export const alt = "Learn Agent Architecture — Your School For The Agentic Era";
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
          backgroundColor: "#FDF8F5",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow blobs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            backgroundColor: "#DD7740",
            opacity: 0.08,
            filter: "blur(90px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-60px",
            width: "380px",
            height: "380px",
            borderRadius: "50%",
            backgroundColor: "#9b4510",
            opacity: 0.07,
            filter: "blur(70px)",
          }}
        />

        {/* Main layout: left content + right logo visual */}
        <div
          style={{
            display: "flex",
            height: "100%",
            padding: "52px 64px",
            position: "relative",
            gap: "48px",
            alignItems: "center",
          }}
        >
          {/* Left: all copy */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "space-between",
              height: "100%",
            }}
          >
            {/* Top badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #DD7740, #9b4510)",
                  borderRadius: "8px",
                  padding: "8px 18px",
                  fontSize: "13px",
                  color: "white",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Anthropic Certification Prep
              </div>
              <div
                style={{
                  backgroundColor: "#F8F3F0",
                  border: "1.5px solid #DCC1B5",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  color: "#9b4510",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                }}
              >
                2 Certification Courses
              </div>
            </div>

            {/* Main headline */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div
                style={{
                  fontSize: "82px",
                  fontWeight: 900,
                  color: "#1C1B1A",
                  lineHeight: 0.92,
                  letterSpacing: "-0.04em",
                }}
              >
                Your School
              </div>
              <div
                style={{
                  fontSize: "52px",
                  fontWeight: 900,
                  color: "#1C1B1A",
                  lineHeight: 0.92,
                  letterSpacing: "-0.04em",
                  opacity: 0.45,
                  fontStyle: "italic",
                }}
              >
                For The
              </div>
              <div
                style={{
                  fontSize: "72px",
                  fontWeight: 900,
                  color: "#9b4510",
                  lineHeight: 0.92,
                  letterSpacing: "-0.03em",
                  fontStyle: "italic",
                }}
              >
                Agentic Era.
              </div>
              <div
                style={{
                  fontSize: "20px",
                  color: "#56433A",
                  fontWeight: 400,
                  marginTop: "16px",
                  lineHeight: 1.45,
                  maxWidth: "540px",
                }}
              >
                The community study platform for Anthropic Certifications —
                covering Agent Architecture and Prompt Engineering.
              </div>
            </div>

            {/* Bottom: stats + URL */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Stat chips */}
              <div style={{ display: "flex", gap: "10px" }}>
                {[
                  { value: "16", label: "Domains" },
                  { value: "138+", label: "Questions" },
                  { value: "2", label: "Courses" },
                  { value: "AI", label: "Tutor" },
                  { value: "Free", label: "To Start" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      backgroundColor: "#F2EDEA",
                      border: "1.5px solid #DCC1B5",
                      borderRadius: "10px",
                      padding: "12px 20px",
                      gap: "2px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: 800,
                        color: "#9b4510",
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#897268",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              {/* URL */}
              <div style={{ fontSize: "15px", color: "#897268", fontWeight: 500 }}>
                learnagentarchitecture.com
              </div>
            </div>
          </div>

          {/* Right: logo mark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "260px",
                height: "260px",
                borderRadius: "56px",
                background: "linear-gradient(135deg, #DD7740 0%, #7A3208 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                boxShadow: "0 32px 80px rgba(155,69,16,0.30)",
              }}
            >
              {/* Letter A recreated with divs */}
              <div
                style={{
                  fontSize: "180px",
                  fontWeight: 900,
                  color: "#FAECE7",
                  letterSpacing: "-0.06em",
                  lineHeight: 1,
                  marginTop: "8px",
                }}
              >
                A
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
