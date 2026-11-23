import { imagemSocial, TAMANHO_OG } from "@/lib/og"

export const alt = "Explorar um lugar no Gatélite"
export const size = TAMANHO_OG
export const contentType = "image/png"

export default function ImagemSocial() {
  return imagemSocial({ titulo: "O seu lugar", destaque: "visto de cima.", legenda: "A imagem de hoje, quem passou por cima e como mudou desde 2000." })
}
