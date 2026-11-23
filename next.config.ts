import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // permite gerar o build de produção em outra pasta sem brigar com o servidor de dev
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // as fotos EPIC chegam com 2048 px (~250 KB): o otimizador entrega AVIF/WebP no tamanho da tela
    remotePatterns: [new URL("https://epic.gsfc.nasa.gov/archive/natural/**")],
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75],
    // o arquivo da EPIC não muda depois de publicado
    minimumCacheTTL: 2_678_400,
  },
}

export default nextConfig
