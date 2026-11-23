import { readFileSync, writeFileSync } from "node:fs"
import { geoBounds, geoContains } from "d3-geo"
import { feature } from "topojson-client"

const topo = JSON.parse(readFileSync("public/dados/terra-110m.json", "utf8"))
const terra = feature(topo, topo.objects.land)
const partes = terra.features.map((f) => ({ f, b: geoBounds(f) }))
const pontos = []
const passo = 1.8
for (let lat = -84; lat <= 84; lat += passo) {
  const passoLng = passo / Math.max(0.2, Math.cos((lat * Math.PI) / 180))
  for (let lng = -180; lng < 180; lng += passoLng) {
    for (const { f, b } of partes) {
      const [[x0, y0], [x1, y1]] = b
      const naCaixa = lat >= y0 && lat <= y1 && (x0 <= x1 ? lng >= x0 && lng <= x1 : lng >= x0 || lng <= x1)
      if (naCaixa && geoContains(f, [lng, lat])) {
        pontos.push(Math.round(lng * 10) / 10, Math.round(lat * 10) / 10)
        break
      }
    }
  }
}
writeFileSync("public/dados/pontos-terra.json", JSON.stringify(pontos))
console.log(`✓ ${pontos.length / 2} pontos`)
