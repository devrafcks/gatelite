import type { MetadataRoute } from "next"
import { MARCA } from "@/lib/marca"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: MARCA.nome,
    short_name: MARCA.nome,
    description: MARCA.descricao,
    start_url: "/",
    display: "standalone",
    background_color: "#08090d",
    theme_color: "#08090d",
    lang: "pt-BR",
    icons: [{ src: "/brand/gatelite-app-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  }
}
