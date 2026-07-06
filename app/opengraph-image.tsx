import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name}: ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "80px", background: "#faf6ee",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, background: "#b5410c", color: "#faf6ee",
            fontSize: 40, fontWeight: 700, fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "center" }}>D</div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, fontFamily: "Georgia, serif", color: "#211b14" }}>
            <span>Deck</span><span style={{ color: "#b5410c" }}>Helm</span>
          </div>
        </div>
        <div style={{ marginTop: 36, fontSize: 60, fontWeight: 700, fontFamily: "Georgia, serif", color: "#211b14", lineHeight: 1.1, maxWidth: 980 }}>
          Free deck building code calculator
        </div>
        <div style={{ marginTop: 24, fontSize: 30, color: "#6b6053", maxWidth: 940 }}>
          Joists, beams, footings, posts & stairs sized to the IRC R507 deck code, with the real span tables.
        </div>
      </div>
    ),
    { ...size },
  );
}
