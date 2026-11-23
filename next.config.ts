import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // permite gerar o build de produção em outra pasta sem brigar com o servidor de dev
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
}

export default nextConfig
