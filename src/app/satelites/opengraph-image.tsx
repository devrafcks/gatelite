import { imagemSocial, TAMANHO_OG } from "@/lib/og"

export const alt = "Satélites ao vivo no Gatélite"
export const size = TAMANHO_OG
export const contentType = "image/png"

export default function ImagemSocial() {
  return imagemSocial({ titulo: "Quem está olhando", destaque: "agora.", legenda: "Landsat, Sentinel, Terra, Aqua e Amazonia-1, ao vivo no globo." })
}
