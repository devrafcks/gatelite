import { imagemSocial, TAMANHO_OG } from "@/lib/og"

export const alt = "Marca do Gatélite"
export const size = TAMANHO_OG
export const contentType = "image/png"

export default function ImagemSocial() {
  return imagemSocial({ titulo: "A marca", destaque: "Gatélite.", legenda: "Um gato no alto do planeta, olhando o céu." })
}
