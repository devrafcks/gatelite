import { imagemSocial, TAMANHO_OG } from "@/lib/og"

export const alt = "Sobre o Gatélite"
export const size = TAMANHO_OG
export const contentType = "image/png"

export default function ImagemSocial() {
  return imagemSocial({ titulo: "Sobre o", destaque: "Gatélite.", legenda: "De onde vêm os dados e como as passagens são calculadas." })
}
