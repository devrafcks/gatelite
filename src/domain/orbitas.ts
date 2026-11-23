import {
  degreesLat,
  degreesLong,
  ecfToLookAngles,
  eciToEcf,
  eciToGeodetic,
  gstime,
  json2satrec,
  propagate,
  type SatRec,
} from "satellite.js"
import { GRAU } from "./constantes"
import { distanciaKm, type LatLng } from "./geo"
import type { Satelite } from "./satelites"
import { elevacaoDoSol } from "./sol"

// Elementos orbitais no formato OMM (JSON da CelesTrak).
export type ElementoOrbital = Record<string, string | number> & { NORAD_CAT_ID: number; OBJECT_NAME: string; EPOCH: string }

export const criarSatrec = (e: ElementoOrbital): SatRec => json2satrec(e as never)

export type Posicao = LatLng & {
  readonly altitudeKm: number
  readonly velocidadeKmS: number
}

type Vec = { x: number; y: number; z: number }

const propagar = (satrec: SatRec, t: Date) => {
  const pv = propagate(satrec, t)
  if (!pv || typeof pv.position !== "object" || !pv.position) return null
  return { posicao: pv.position as unknown as Vec, velocidade: pv.velocity as unknown as Vec }
}

export const posicaoEm = (satrec: SatRec, t: Date): Posicao | null => {
  const pv = propagar(satrec, t)
  if (!pv) return null
  const gmst = gstime(t)
  const geo = eciToGeodetic(pv.posicao as never, gmst)
  const v = pv.velocidade
  return {
    lat: degreesLat(geo.latitude),
    lng: degreesLong(geo.longitude),
    altitudeKm: geo.height as unknown as number,
    velocidadeKmS: Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),
  }
}

export const visadaDe = (satrec: SatRec, obs: LatLng, t: Date) => {
  const pv = propagar(satrec, t)
  if (!pv) return null
  const gmst = gstime(t)
  const ecf = eciToEcf(pv.posicao as never, gmst)
  const la = ecfToLookAngles({ latitude: obs.lat * GRAU, longitude: obs.lng * GRAU, height: 0 } as never, ecf as never)
  return {
    elevacao: (la.elevation as unknown as number) / GRAU,
    azimute: (((la.azimuth as unknown as number) / GRAU) + 360) % 360,
    distanciaKm: la.rangeSat as unknown as number,
  }
}

export const rastroEntre = (satrec: SatRec, inicio: number, fim: number, passoS = 30): LatLng[] => {
  const pontos: LatLng[] = []
  for (let t = inicio; t <= fim; t += passoS * 1000) {
    const p = posicaoEm(satrec, new Date(t))
    if (p) pontos.push({ lat: p.lat, lng: p.lng })
  }
  return pontos
}

// ── Passagens sobre um lugar ─────────────────────────────────────────────────
// Para um satélite de imagem, "passar por cima" é o lugar cair dentro da faixa que o
// sensor varre. Procura os instantes em que o ponto no chão sob o satélite chega mais
// perto do lugar e mede a distância nesse instante: é o afastamento lateral da faixa.
export type Passagem = {
  readonly id: string
  readonly norad: number
  readonly t: number
  /** distância do lugar ao rastro no instante mais próximo */
  readonly afastamentoKm: number
  readonly dentroDaFaixa: boolean
  readonly elevacao: number
  readonly sentido: "norte" | "sul"
  readonly lado: "leste" | "oeste"
  /** Sol acima do horizonte no lugar: um sensor óptico vê alguma coisa */
  readonly deDia: boolean
  readonly elevacaoDoSol: number
}

const refinarMinimo = (f: (t: number) => number, a: number, b: number) => {
  // seção áurea: a distância perto do mínimo é uma curva suave
  const r = (Math.sqrt(5) - 1) / 2
  let x1 = b - r * (b - a)
  let x2 = a + r * (b - a)
  let f1 = f(x1)
  let f2 = f(x2)
  for (let i = 0; i < 28 && b - a > 500; i++) {
    if (f1 < f2) {
      b = x2
      x2 = x1
      f2 = f1
      x1 = b - r * (b - a)
      f1 = f(x1)
    } else {
      a = x1
      x1 = x2
      f1 = f2
      x2 = a + r * (b - a)
      f2 = f(x2)
    }
  }
  return (a + b) / 2
}

export const passagensSobre = (
  satrec: SatRec,
  sat: Satelite,
  lugar: LatLng,
  inicio: number,
  fim: number,
  // passo grosso + refinamento por seção áurea: a distância perto do mínimo é suave,
  // então 45 s não perdem nenhuma passagem e custam menos da metade dos cálculos
  { passoS = 45, alcanceKm }: { passoS?: number; alcanceKm?: number } = {},
): Passagem[] => {
  const limite = alcanceKm ?? Math.max(900, sat.faixaKm * 0.9)
  const dist = (t: number) => {
    const p = posicaoEm(satrec, new Date(t))
    return p ? distanciaKm(p, lugar) : Number.POSITIVE_INFINITY
  }
  const passagens: Passagem[] = []
  const passo = passoS * 1000
  let d0 = dist(inicio)
  let d1 = dist(inicio + passo)
  for (let t = inicio + passo; t + passo <= fim; t += passo) {
    const d2 = dist(t + passo)
    if (d1 <= d0 && d1 < d2 && d1 < limite + 300) {
      const tMin = refinarMinimo(dist, t - passo, t + passo)
      const afastamentoKm = dist(tMin)
      if (afastamentoKm <= limite) {
        const antes = posicaoEm(satrec, new Date(tMin - 5000))
        const depois = posicaoEm(satrec, new Date(tMin + 5000))
        const agora = posicaoEm(satrec, new Date(tMin))
        const v = visadaDe(satrec, lugar, new Date(tMin))
        const sol = elevacaoDoSol(new Date(tMin), lugar.lat, lugar.lng)
        // no instante mais próximo, o rastro corre quase norte-sul: o lado é a longitude
        const dLng = agora ? ((agora.lng - lugar.lng + 540) % 360) - 180 : 0
        const lado: "leste" | "oeste" = dLng >= 0 ? "leste" : "oeste"
        passagens.push({
          id: `${sat.norad}-${Math.round(tMin / 1000)}`,
          norad: sat.norad,
          t: tMin,
          afastamentoKm,
          dentroDaFaixa: sat.faixaKm > 0 && afastamentoKm <= sat.faixaKm / 2,
          elevacao: v?.elevacao ?? 0,
          sentido: antes && depois && depois.lat > antes.lat ? "norte" : "sul",
          lado,
          deDia: sol > 5,
          elevacaoDoSol: sol,
        })
      }
    }
    d0 = d1
    d1 = d2
  }
  return passagens
}

// Passagens visíveis a olho nu (para a ISS): acima de 10°, céu escuro no lugar e a
// estação iluminada. Aqui só checa céu escuro e altura; o brilho vem do Sol no satélite.
export const passagensVisiveis = (satrec: SatRec, lugar: LatLng, inicio: number, fim: number, passoS = 20) => {
  const resultado: { inicio: number; fim: number; pico: number; elevacaoMax: number }[] = []
  let atual: { inicio: number; fim: number; pico: number; elevacaoMax: number } | null = null
  for (let t = inicio; t <= fim; t += passoS * 1000) {
    const v = visadaDe(satrec, lugar, new Date(t))
    const acima = v && v.elevacao >= 10
    if (acima && v) {
      if (!atual) atual = { inicio: t, fim: t, pico: t, elevacaoMax: v.elevacao }
      atual.fim = t
      if (v.elevacao > atual.elevacaoMax) {
        atual.elevacaoMax = v.elevacao
        atual.pico = t
      }
    } else if (atual) {
      resultado.push(atual)
      atual = null
    }
  }
  if (atual) resultado.push(atual)
  return resultado.map((p) => ({ ...p, ceuEscuro: elevacaoDoSol(new Date(p.pico), lugar.lat, lugar.lng) < -6 }))
}

export const idadeDosElementosDias = (e: ElementoOrbital, agora = Date.now()) =>
  (agora - Date.parse(`${e.EPOCH}Z`)) / 86_400_000
