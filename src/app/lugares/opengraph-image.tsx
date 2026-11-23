import { imagemSocial, TAMANHO_OG } from "@/lib/og"

export const alt = "Lugares salvos no Gatélite"
export const size = TAMANHO_OG
export const contentType = "image/png"

export default function ImagemSocial() {
  return imagemSocial({ titulo: "Seus lugares,", destaque: "de cima.", legenda: "Os lugares salvos, com a imagem de satélite mais recente." })
}
