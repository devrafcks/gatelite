import { ImageResponse } from "next/og"
import { simboloDataUri } from "@/components/brand/simbolo-svg"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// ícone da tela inicial do iPhone: o gato no planeta sobre a noite
export default function IconeApple() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0e0e12" }}>
      {/* biome-ignore lint/performance/noImgElement: ícone gerado no servidor */}
      <img src={simboloDataUri()} width={140} height={140} alt="" />
    </div>,
    size,
  )
}
