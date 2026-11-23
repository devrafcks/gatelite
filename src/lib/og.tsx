import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { CORES } from "@/components/brand/marca-dados"
import { logotipoDataUri, simboloDataUri } from "@/components/brand/simbolo-svg"

export const TAMANHO_OG = { width: 1200, height: 630 }

const fonte = (arquivo: string) => readFile(join(process.cwd(), "scripts/fonts", arquivo))

export async function imagemSocial({
  titulo,
  destaque,
  legenda,
}: {
  titulo: string
  destaque?: string
  legenda: string
}) {
  const [display, texto] = await Promise.all([fonte("anybody-150-600.ttf"), fonte("anybody-150-600.ttf")])
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background:
          "radial-gradient(60% 80% at 92% 115%, rgba(255,90,31,0.45) 0%, rgba(255,90,31,0) 60%), radial-gradient(70% 90% at 0% 120%, rgba(43,91,215,0.6) 0%, rgba(43,91,215,0) 65%), #08090d",
        color: "#f4f3f1",
        fontFamily: "Anybody",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <img src={simboloDataUri()} width={84} height={84} alt="" />
        <img src={logotipoDataUri().uri} height={30} width={Math.round(30 * logotipoDataUri().proporcao)} alt="" />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 78, lineHeight: 1.04, letterSpacing: -2 }}>
          <span>{titulo}</span>
          {destaque && <span style={{ color: CORES.laranja }}>{destaque}</span>}
        </div>
        <div style={{ display: "flex", marginTop: 28, maxWidth: 900, fontSize: 25, lineHeight: 1.35, color: "rgba(244,243,241,0.66)", fontFamily: "Texto" }}>
          {legenda}
        </div>
      </div>
    </div>,
    {
      ...TAMANHO_OG,
      fonts: [
        { name: "Anybody", data: display, weight: 600, style: "normal" },
        { name: "Texto", data: texto, weight: 600, style: "normal" },
      ],
    },
  )
}
