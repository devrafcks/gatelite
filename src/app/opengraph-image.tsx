import { imagemSocial, TAMANHO_OG } from "@/lib/og"

export const alt = "Gatélite · A Terra de hoje, vista de cima."
export const size = TAMANHO_OG
export const contentType = "image/png"

export default function ImagemSocial() {
  return imagemSocial({
    titulo: "A Terra de hoje,",
    destaque: "vista de cima.",
    legenda: "Imagens de satélite, passagens e eventos ao vivo, com dados abertos da NASA.",
  })
}
