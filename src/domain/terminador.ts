import { Body, Equator, Observer, SiderealTime } from "astronomy-engine"
import { GRAU } from "./constantes"

export const pontoSubsolar = (d: Date) => {
  const eq = Equator(Body.Sun, d, new Observer(0, 0, 0), true, true)
  const lng = ((((eq.ra - SiderealTime(d)) * 15 + 540) % 360) - 180)
  return { lat: eq.dec, lng }
}

const latitudeDaAltura = (lng: number, sol: { lat: number; lng: number }, h: number) => {
  const delta = sol.lat * GRAU
  const H = (lng - sol.lng) * GRAU
  const a = Math.sin(delta)
  const b = Math.cos(delta) * Math.cos(H)
  const R = Math.hypot(a, b)
  const theta = Math.atan2(b, a)
  const s = Math.max(-1, Math.min(1, Math.sin(h * GRAU) / R))
  const normal = (x: number) => ((((x / GRAU) + 540) % 360) - 180)
  const c1 = normal(Math.asin(s) - theta)
  const c2 = normal(Math.PI - Math.asin(s) - theta)
  const dentro = [c1, c2].filter((c) => c >= -90 && c <= 90)
  return dentro.length ? (dentro.sort((x, y) => Math.abs(x) - Math.abs(y))[0] as number) : c1 > 0 ? 90 : -90
}

export const poligonoDaNoite = (d: Date, h = 0): [number, number][] => {
  const sol = pontoSubsolar(d)
  const linha: [number, number][] = []
  for (let lng = -180; lng <= 180; lng += 2) linha.push([lng, latitudeDaAltura(lng, sol, h)])
  const poloEscuro = sol.lat > 0 ? -90 : 90
  return [...linha, [180, poloEscuro], [-180, poloEscuro], linha[0] as [number, number]]
}
