import { ImageResponse } from "next/og";

export const alt = "Rizwanul Islam Rudra — Forward Deployed AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#F8F5F0",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "0 80px 64px",
        fontFamily: "Georgia, serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Terracotta top stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: "#B85C38",
        }}
      />

      {/* Faint background number */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -30,
          fontSize: 520,
          fontWeight: 300,
          fontStyle: "italic",
          color: "#E2DDD4",
          lineHeight: 1,
          letterSpacing: -30,
          userSelect: "none",
        }}
      >
        riz
      </div>

      {/* Content area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          flex: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#B85C38",
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          <div style={{ width: 32, height: 1, background: "#B85C38" }} />
          Forward Deployed AI Engineer · Tech Lead
        </div>

        {/* Name */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "#1C1916",
            fontSize: 88,
            fontWeight: 300,
            lineHeight: 0.95,
            letterSpacing: -4,
            marginBottom: 28,
          }}
        >
          <span>Rizwanul</span>
          <span style={{ fontStyle: "italic", color: "#B85C38" }}>Islam Rudra</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: "#78746D",
            fontSize: 22,
            lineHeight: 1.6,
            maxWidth: 620,
            marginBottom: 36,
          }}
        >
          Building agentic AI systems, scalable infrastructure, and
          human-centered product experiences.
        </div>

        {/* Domain */}
        <div
          style={{
            color: "#B5B0A7",
            fontSize: 16,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          riz1.dev
        </div>
      </div>
    </div>,
    { ...size }
  );
}
