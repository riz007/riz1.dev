import { ImageResponse } from "next/og";

export const alt = "Rizwanul Islam Rudra — Staff Frontend Engineer & Technical Lead";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0c0d18",
        backgroundImage:
          "radial-gradient(circle at 12% 8%, rgba(91,77,255,0.4), transparent 52%), radial-gradient(circle at 90% 95%, rgba(45,212,191,0.28), transparent 50%), radial-gradient(circle at 70% 20%, rgba(255,107,170,0.12), transparent 45%)",
        fontFamily: "sans-serif",
      }}
    >
      {/* menu bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 52,
          padding: "0 36px",
          backgroundColor: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.09)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: "linear-gradient(135deg, #8b8bff, #43e7d5)",
            }}
          />
          <div style={{ color: "#f2f3f8", fontSize: 20, fontWeight: 700 }}>RudraOS</div>
        </div>
        <div style={{ color: "#a2a7bd", fontSize: 18, letterSpacing: 2 }}>riz1.dev</div>
      </div>

      {/* window card */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "44px 60px 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            borderRadius: 20,
            backgroundColor: "rgba(28,30,44,0.85)",
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}
        >
          {/* titlebar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: 58,
              padding: "0 26px",
              borderBottom: "1px solid rgba(255,255,255,0.09)",
              backgroundColor: "rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 16, height: 16, borderRadius: 999, backgroundColor: "#ff5f57" }} />
              <div style={{ width: 16, height: 16, borderRadius: 999, backgroundColor: "#febc2e" }} />
              <div style={{ width: 16, height: 16, borderRadius: 999, backgroundColor: "#28c840" }} />
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                color: "#a2a7bd",
                fontSize: 19,
              }}
            >
              about.md
            </div>
            <div style={{ width: 72 }} />
          </div>

          {/* body */}
          <div style={{ display: "flex", flexDirection: "column", padding: "42px 52px 46px" }}>
            <div
              style={{
                color: "#8b8bff",
                fontSize: 20,
                letterSpacing: 5,
                textTransform: "uppercase",
                marginBottom: 22,
              }}
            >
              Staff Frontend Engineer · Technical Lead
            </div>
            <div
              style={{
                color: "#f2f3f8",
                fontSize: 76,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: -2,
                marginBottom: 26,
              }}
            >
              Rizwanul Islam Rudra
            </div>
            <div
              style={{
                color: "#a2a7bd",
                fontSize: 26,
                lineHeight: 1.5,
                maxWidth: 860,
                marginBottom: 34,
              }}
            >
              Frontend architecture, design systems, and AI-powered product experiences — based in Bangkok.
            </div>
            <div style={{ color: "#43e7d5", fontSize: 20, letterSpacing: 2 }}>
              TypeScript · Vue · React · Next.js · LLMs · RAG · Agentic AI
            </div>
          </div>
        </div>
      </div>
    </div>,
    { ...size }
  );
}
