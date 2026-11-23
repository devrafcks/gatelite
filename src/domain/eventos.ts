import { distanciaKm, type LatLng } from "./geo"

// Eventos naturais do NASA EONET, já normalizados para a interface.
export type CategoriaEvento =
  | "wildfires"
  | "severeStorms"
  | "volcanoes"
  | "seaLakeIce"
  | "floods"
  | "drought"
  | "dustHaze"
  | "earthquakes"
  | "landslides"
  | "snow"
  | "tempExtremes"
  | "waterColor"
  | "manmade"

export const CATEGORIAS: Record<CategoriaEvento, { nome: string; singular: string }> = {
  wildfires: { nome: "Queimadas", singular: "Queimada" },
  severeStorms: { nome: "Tempestades", singular: "Tempestade" },
  volcanoes: { nome: "Vulcões", singular: "Vulcão" },
  seaLakeIce: { nome: "Gelo marinho", singular: "Iceberg" },
  floods: { nome: "Enchentes", singular: "Enchente" },
  drought: { nome: "Secas", singular: "Seca" },
  dustHaze: { nome: "Poeira e fumaça", singular: "Poeira" },
  earthquakes: { nome: "Terremotos", singular: "Terremoto" },
  landslides: { nome: "Deslizamentos", singular: "Deslizamento" },
  snow: { nome: "Neve", singular: "Neve" },
  tempExtremes: { nome: "Temperatura extrema", singular: "Calor ou frio extremo" },
  waterColor: { nome: "Cor da água", singular: "Água alterada" },
  manmade: { nome: "Causados por gente", singular: "Evento humano" },
}

export type Evento = {
  readonly id: string
  readonly titulo: string
  readonly categoria: CategoriaEvento
  readonly lat: number
  readonly lng: number
  readonly data: string
  readonly fonte: string | null
  readonly link: string | null
  readonly magnitude: string | null
}

type RespostaEonet = {
  events: {
    id: string
    title: string
    categories: { id: string }[]
    sources: { id: string; url: string }[]
    geometry: {
      date: string
      type: "Point" | "Polygon"
      coordinates: number[] | number[][][]
      magnitudeValue?: number | null
      magnitudeUnit?: string | null
    }[]
  }[]
}

const centroDe = (g: RespostaEonet["events"][number]["geometry"][number]): [number, number] | null => {
  if (g.type === "Point") return [g.coordinates[0] as number, g.coordinates[1] as number]
  const anel = (g.coordinates as number[][][])[0]
  if (!anel?.length) return null
  const s = anel.reduce((a, p) => [a[0] + (p[0] ?? 0), a[1] + (p[1] ?? 0)], [0, 0])
  return [s[0] / anel.length, s[1] / anel.length]
}

export const normalizarEonet = (r: RespostaEonet): Evento[] =>
  r.events.flatMap((e) => {
    const g = e.geometry[e.geometry.length - 1]
    const cat = e.categories[0]?.id as CategoriaEvento | undefined
    if (!g || !cat || !(cat in CATEGORIAS)) return []
    const c = centroDe(g)
    if (!c) return []
    return [
      {
        id: e.id,
        titulo: e.title,
        categoria: cat,
        lng: c[0],
        lat: c[1],
        data: g.date,
        fonte: e.sources[0]?.id ?? null,
        link: e.sources[0]?.url ?? null,
        magnitude: g.magnitudeValue != null ? `${g.magnitudeValue} ${g.magnitudeUnit ?? ""}`.trim() : null,
      },
    ]
  })

export const eventosPerto = (eventos: readonly Evento[], lugar: LatLng, raioKm = 1500) =>
  eventos
    .map((e) => ({ ...e, distanciaKm: distanciaKm(lugar, e) }))
    .filter((e) => e.distanciaKm <= raioKm)
    .sort((a, b) => a.distanciaKm - b.distanciaKm)

export const contarPorCategoria = (eventos: readonly Evento[]) => {
  const mapa = new Map<CategoriaEvento, number>()
  for (const e of eventos) mapa.set(e.categoria, (mapa.get(e.categoria) ?? 0) + 1)
  return [...mapa.entries()].sort((a, b) => b[1] - a[1])
}
