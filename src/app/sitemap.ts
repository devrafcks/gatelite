import type { MetadataRoute } from "next"
import { MARCA } from "@/lib/marca"

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/explorar", "/planeta", "/satelites", "/lugares", "/marca", "/sobre"].map((p) => ({
    url: `${MARCA.url}${p}`,
    lastModified: new Date("2026-11-23"),
    changeFrequency: p === "" || p === "/planeta" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.7,
  }))
}
