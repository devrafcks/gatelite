import { cacheLife } from "next/cache"
import elementosLocais from "@/data/elementos.json"
import { type Evento, normalizarEonet } from "@/domain/eventos"
import { type FotoEpic, normalizarEpic } from "@/domain/epic"
import type { ElementoOrbital } from "@/domain/orbitas"
import { SATELITES } from "@/domain/satelites"

const AGENTE = "Gatelite/1.0 (projeto educativo)"
const CHAVE_NASA = process.env.NASA_API_KEY ?? "DEMO_KEY"

const pegarJson = async <T>(url: string, timeoutMs = 15_000): Promise<T> => {
  const r = await fetch(url, {
    headers: { "User-Agent": AGENTE, Accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!r.ok) throw new Error(`${new URL(url).host} respondeu ${r.status}`)
  return (await r.json()) as T
}

export type Elementos = { readonly fonte: "CelesTrak" | "cópia local"; readonly elementos: readonly ElementoOrbital[] }

export async function buscarElementos(): Promise<Elementos> {
  "use cache"
  cacheLife({ stale: 3600, revalidate: 4 * 3600, expire: 86_400 })
  try {
    const lista = await Promise.all(
      SATELITES.map((s) =>
        pegarJson<ElementoOrbital[]>(`https://celestrak.org/NORAD/elements/gp.php?CATNR=${s.norad}&FORMAT=json`, 12_000)
          .then((r) => r[0] ?? null)
          .catch(() => null),
      ),
    )
    const ok = lista.filter((e): e is ElementoOrbital => e != null)
    if (ok.length >= SATELITES.length - 2) {
      const faltando = (elementosLocais as ElementoOrbital[]).filter((l) => !ok.some((e) => e.NORAD_CAT_ID === l.NORAD_CAT_ID))
      return { fonte: "CelesTrak", elementos: [...ok, ...faltando] }
    }
  } catch {
  }
  return { fonte: "cópia local", elementos: elementosLocais as ElementoOrbital[] }
}

export async function buscarDatasEpic(): Promise<string[]> {
  "use cache"
  cacheLife("hours")
  const datas = await pegarJson<string[]>("https://epic.gsfc.nasa.gov/api/natural/available")
  return datas.slice(-60)
}

export async function buscarFotosEpic(data?: string): Promise<FotoEpic[]> {
  "use cache"
  if (data) cacheLife("weeks")
  else cacheLife("hours")
  const url = data ? `https://epic.gsfc.nasa.gov/api/natural/date/${data}` : "https://epic.gsfc.nasa.gov/api/natural"
  return normalizarEpic(await pegarJson(url))
}

export type Eventos = { readonly atualizadoEm: string; readonly eventos: readonly Evento[] }

export async function buscarEventos(): Promise<Eventos> {
  "use cache"
  cacheLife({ stale: 900, revalidate: 1800, expire: 86_400 })
  const r = await pegarJson<Parameters<typeof normalizarEonet>[0]>(
    "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=60&limit=800",
    25_000,
  )
  return { atualizadoEm: new Date().toISOString(), eventos: normalizarEonet(r) }
}

export type Apod = {
  readonly data: string
  readonly titulo: string
  readonly explicacao: string
  readonly url: string
  readonly urlHd: string | null
  readonly tipo: "image" | "video" | "other"
  readonly credito: string | null
}

type RespostaApod = {
  date: string
  title: string
  explanation: string
  url: string
  hdurl?: string
  media_type: Apod["tipo"]
  copyright?: string
}

export async function buscarApod(): Promise<Apod> {
  "use cache"
  cacheLife("hours")
  const pedir = (data?: string) =>
    pegarJson<RespostaApod>(`https://api.nasa.gov/planetary/apod?api_key=${CHAVE_NASA}&thumbs=true${data ? `&date=${data}` : ""}`)
  const ontem = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  const r = await pedir().catch(() => pedir(ontem))
  return {
    data: r.date,
    titulo: r.title,
    explicacao: r.explanation,
    url: r.url,
    urlHd: r.hdurl ?? null,
    tipo: r.media_type,
    credito: r.copyright?.trim() ?? null,
  }
}

export type Lugar = { readonly nome: string; readonly detalhe: string; readonly lat: number; readonly lng: number }

type RespostaPhoton = {
  features: {
    geometry: { coordinates: [number, number] }
    properties: { name?: string; city?: string; state?: string; country?: string; street?: string }
  }[]
}
type RespostaGeocoding = {
  results?: { name: string; latitude: number; longitude: number; admin1?: string; country?: string }[]
}

export const normalizarConsulta = (q: string) => q.trim().replace(/\s+/g, " ").toLowerCase()

const doPhoton = async (q: string): Promise<Lugar[]> => {
  const r = await pegarJson<RespostaPhoton>(`https://photon.komoot.io/api/?q=${q}&limit=6`, 3500)
  return r.features.map((f) => {
    const p = f.properties
    const nome = p.name ?? p.street ?? p.city ?? "Lugar sem nome"
    return {
      nome,
      detalhe: [p.city !== nome ? p.city : null, p.state, p.country].filter(Boolean).join(", "),
      lng: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
    }
  })
}

const doOpenMeteo = async (q: string): Promise<Lugar[]> => {
  const r = await pegarJson<RespostaGeocoding>(`https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=6&language=pt`, 3500)
  return (r.results ?? []).map((x) => ({
    nome: x.name,
    detalhe: [x.admin1, x.country].filter(Boolean).join(", "),
    lat: x.latitude,
    lng: x.longitude,
  }))
}

const mesmoLugar = (a: Lugar, b: Lugar) => Math.abs(a.lat - b.lat) < 0.05 && Math.abs(a.lng - b.lng) < 0.05

export async function buscarLugares(consulta: string): Promise<Lugar[]> {
  "use cache"
  cacheLife("days")
  const q = encodeURIComponent(normalizarConsulta(consulta))
  const tentativas = [doPhoton(q), doOpenMeteo(q)]
  const util = (p: Promise<Lugar[]>) => p.then((r) => (r.length ? r : Promise.reject(new Error("vazio"))))
  let primeiro: Lugar[]
  try {
    primeiro = await Promise.any(tentativas.map(util))
  } catch {
    return []
  }
  const respiro = new Promise<null>((ok) => setTimeout(() => ok(null), 250))
  const todos = await Promise.race([Promise.allSettled(tentativas), respiro])
  if (!todos) return primeiro
  const juntos: Lugar[] = []
  for (const r of todos) {
    if (r.status !== "fulfilled") continue
    for (const l of r.value) if (!juntos.some((j) => mesmoLugar(j, l))) juntos.push(l)
  }
  return juntos.slice(0, 7)
}
