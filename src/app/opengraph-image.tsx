import { ImageResponse } from "next/og";

export const alt = "Butakia — Lee libros gratis online";
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
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 70% 30%, #3b0d0d 0%, #0b0b0b 55%), linear-gradient(135deg, #0b0b0b 0%, #050505 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 96,
              height: 96,
              borderRadius: 22,
              background: "linear-gradient(135deg, #e50914, #ff1a25)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
            }}
          >
            📚
          </div>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 900, color: "white", letterSpacing: -2 }}>
            Buta<span style={{ color: "#e50914" }}>kia</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "rgba(255,255,255,0.65)", marginTop: 28 }}>
          Lee libros gratis online
        </div>
      </div>
    ),
    size
  );
}
