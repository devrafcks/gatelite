import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [new URL("https://epic.gsfc.nasa.gov/archive/natural/**")],
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75],
    minimumCacheTTL: 2_678_400,
  },
}

export default nextConfig
