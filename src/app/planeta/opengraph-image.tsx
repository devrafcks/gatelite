import { imagemSocial, TAMANHO_OG } from "@/lib/og"

export const alt = "O planeta agora, no Gatélite"
export const size = TAMANHO_OG
export const contentType = "image/png"

export default function ImagemSocial() {
  return imagemSocial({ titulo: "O planeta,", destaque: "agora.", legenda: "O dia, a noite e as luzes das cidades, ao vivo." })
}
