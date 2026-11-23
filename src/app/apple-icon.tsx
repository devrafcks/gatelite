import { ImageResponse } from "next/og"
import { simboloDataUri } from "@/components/brand/simbolo-svg"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function IconeApple() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0e0e12" }}>
      <img src={simboloDataUri()} width={140} height={140} alt="" />
    </div>,
    size,
  )
}
