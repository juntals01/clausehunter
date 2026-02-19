import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Expiration Reminder AI - Never miss a contract renewal"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #FFFBF5 0%, #FFF7ED 50%, #FFEDD5 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#EA580C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            ERA
          </div>
          <span style={{ fontSize: "48px", fontWeight: "bold", color: "#1C1917" }}>
            Expiration Reminder AI
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: "28px",
            color: "#78716C",
            maxWidth: "700px",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          AI-powered contract analysis. Never miss a renewal deadline again.
        </p>

        {/* URL */}
        <p
          style={{
            fontSize: "18px",
            color: "#EA580C",
            marginTop: "32px",
            fontWeight: 600,
          }}
        >
          expirationreminderai.com
        </p>
      </div>
    ),
    { ...size }
  )
}
