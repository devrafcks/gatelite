import { GRAU, RAIO_DA_TERRA_KM } from "./constantes"

export type LatLng = { readonly lat: number; readonly lng: number }

export const distanciaKm = (a: LatLng, b: LatLng): number => {
  const dLat = (b.lat - a.lat) * GRAU
  const dLng = (b.lng - a.lng) * GRAU
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * GRAU) * Math.cos(b.lat * GRAU) * Math.sin(dLng / 2) ** 2
  return 2 * RAIO_DA_TERRA_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

export const rumo = (a: LatLng, b: LatLng): number => {
  const f1 = a.lat * GRAU
  const f2 = b.lat * GRAU
  const dl = (b.lng - a.lng) * GRAU
  const y = Math.sin(dl) * Math.cos(f2)
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl)
  return ((Math.atan2(y, x) / GRAU) + 360) % 360
}

export const destino = (p: LatLng, rumoGraus: number, km: number): LatLng => {
  const d = km / RAIO_DA_TERRA_KM
  const b = rumoGraus * GRAU
  const f1 = p.lat * GRAU
  const l1 = p.lng * GRAU
  const f2 = Math.asin(Math.sin(f1) * Math.cos(d) + Math.cos(f1) * Math.sin(d) * Math.cos(b))
  const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(f1), Math.cos(d) - Math.sin(f1) * Math.sin(f2))
  return { lat: f2 / GRAU, lng: ((((l2 / GRAU) + 540) % 360) - 180) }
}

export const caixaAoRedor = (p: LatLng, raioKm: number) => {
  const dLat = raioKm / 111.32
  const dLng = raioKm / (111.32 * Math.max(0.1, Math.cos(p.lat * GRAU)))
  return {
    sul: Math.max(-90, p.lat - dLat),
    norte: Math.min(90, p.lat + dLat),
    oeste: Math.max(-180, p.lng - dLng),
    leste: Math.min(180, p.lng + dLng),
  }
}

export const poligonoDaFaixa = (rastro: readonly LatLng[], larguraKm: number): LatLng[] => {
  if (rastro.length < 2 || larguraKm <= 0) return []
  const esquerda: LatLng[] = []
  const direita: LatLng[] = []
  for (let i = 0; i < rastro.length; i++) {
    const a = rastro[Math.max(0, i - 1)] as LatLng
    const b = rastro[Math.min(rastro.length - 1, i + 1)] as LatLng
    const r = rumo(a, b)
    const p = rastro[i] as LatLng
    esquerda.push(destino(p, r - 90, larguraKm / 2))
    direita.push(destino(p, r + 90, larguraKm / 2))
  }
  return [...esquerda, ...direita.reverse()]
}

const ROSA = ["norte", "nordeste", "leste", "sudeste", "sul", "sudoeste", "oeste", "noroeste"] as const
export const direcaoPorExtenso = (graus: number) => ROSA[Math.round((((graus % 360) + 360) % 360) / 45) % 8] as string
