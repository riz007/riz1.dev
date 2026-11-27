import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#1a1714";
const PAPER = "#faf7f2";
const ACCENT = "#a4461f";
const DESKTOP = "#cda598";

const font = (file) => fs.readFile(path.join(process.cwd(), "assets/og", file));

function Stripes() {
  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "space-between", height: 28 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ height: 3, backgroundColor: INK }} />
      ))}
    </div>
  );
}

/* One share card for every page: a window on the RudraOS desktop. */
export async function ogCard({ file, title, subtitle, meta }) {
  const [pixel, regular, semibold] = await Promise.all([
    font("PixelifySans-SemiBold.ttf"),
    font("IBMPlexMono-Regular.ttf"),
    font("IBMPlexMono-SemiBold.ttf"),
  ]);
  const titleSize = title.length > 70 ? 56 : title.length > 40 ? 68 : 86;

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", backgroundColor: DESKTOP, padding: "44px 56px 56px 44px", fontFamily: "Plex" }}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%", backgroundColor: PAPER, border: `4px solid ${INK}`, boxShadow: `14px 14px 0 ${INK}`, color: INK }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, height: 62, padding: "0 20px", borderBottom: `4px solid ${INK}` }}>
          <div style={{ width: 28, height: 28, border: `4px solid ${INK}` }} />
          <Stripes />
          <div style={{ fontFamily: "Pixelify", fontSize: 30 }}>{file}</div>
          <Stripes />
        </div>
        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", padding: "24px 56px" }}>
          <div style={{ display: "flex", fontFamily: "Pixelify", fontSize: titleSize, lineHeight: 1.08 }}>{title}</div>
          {subtitle && (
            <div style={{ display: "flex", marginTop: 24, fontSize: 28, fontWeight: 600, lineHeight: 1.4, color: ACCENT }}>{subtitle}</div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, padding: "20px 56px", borderTop: `4px solid ${INK}`, fontSize: 23 }}>
          <div style={{ display: "flex" }}>{meta}</div>
          <div style={{ display: "flex", padding: "6px 18px", backgroundColor: ACCENT, color: PAPER, fontWeight: 600 }}>riz1.dev</div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Pixelify", data: pixel, weight: 400 },
        { name: "Plex", data: regular, weight: 400 },
        { name: "Plex", data: semibold, weight: 600 },
      ],
    }
  );
}
