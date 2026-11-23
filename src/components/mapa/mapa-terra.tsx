"use client"

import { IconCurrentLocation, IconMap2, IconMinus, IconPlus, IconWorld, IconZoomIn, IconZoomOut } from "@tabler/icons-react"
import {
  type Map as MapaML,
  Map as MapLibre,
  Marker,
  setWorkerUrl,
  type StyleSpecification,
} from "maplibre-gl"
import { useEffect, useRef, useState } from "react"
import "maplibre-gl/dist/maplibre-gl.css"
import type { CategoriaEvento } from "@/domain/eventos"
import type { LatLng } from "@/domain/geo"
import { type Camada, CAMADAS, urlDosBlocos } from "@/domain/gibs"
import { COR_DA_CATEGORIA } from "@/components/terra/icone-evento"
import { cn } from "@/lib/utils"

setWorkerUrl("/maplibre/maplibre-gl-worker.mjs")

export type Sobreposicoes = {
  rastros?: readonly { id: string; pontos: readonly LatLng[]; ativo?: boolean }[]
  faixas?: readonly { id: string; poligono: readonly LatLng[]; ativo?: boolean }[]
  eventos?: readonly { id: string; lat: number; lng: number; categoria: CategoriaEvento; titulo: string }[]
  satelites?: readonly { id: string; lat: number; lng: number; nome: string; ativo?: boolean }[]
}

type Props = {
  ponto?: LatLng | null
  visao: { centro: LatLng; zoom: number }
  camada: Camada
  data: string
  opacidade?: number
  sobreposicoes?: Sobreposicoes
  aoClicar?: (p: LatLng) => void
  aoMover?: (centro: LatLng, zoom: number) => void
  aoClicarEvento?: (id: string) => void
  aoClicarSatelite?: (id: string) => void
  aoPassarDoLimite?: () => void
  className?: string
  controles?: boolean
  rotulos?: boolean
}

const vazio = { type: "FeatureCollection" as const, features: [] as GeoJSON.Feature[] }
type ComDados = { setData: (d: GeoJSON.GeoJSON) => void }
const fonte = (m: MapaML, id: string) => m.getSource(id) as unknown as ComDados | undefined

const ESTILO: StyleSpecification = {
  version: 8,
  projection: { type: "globe" },
  sources: {
    rotulos: {
      type: "raster",
      tiles: ["https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      minzoom: 4,
      maxzoom: 19,
      attribution: "Rótulos: Esri",
    },
  },
  layers: [
    { id: "fundo", type: "background", paint: { "background-color": "#05060a", "background-opacity": 0 } },
  ],
  sky: {
    "sky-color": "rgba(5, 6, 10, 0)",
    "horizon-color": "rgba(64, 120, 255, 0.55)",
    "fog-color": "rgba(10, 18, 40, 0.6)",
    "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 3, 0.8, 5, 0],
  },
}

type Fonte = { id: string; url: string; maxzoom: number; atribuicao: string; principal: boolean }
const fontesDaCamada = (camada: Camada, data: string): Fonte[] => {
  const da = (c: Camada, principal: boolean): Fonte[] =>
    c.blocos
      ? [{ id: `dia-${c.id}`, url: c.blocos.url, maxzoom: c.nivelMaximo, atribuicao: c.blocos.atribuicao, principal }]
      : c.gibs.map((g) => ({
          id: `dia-${g}`,
          url: urlDosBlocos(g, c, data),
          maxzoom: c.nivelMaximo,
          atribuicao: "Imagens: NASA GIBS / EOSDIS",
          principal,
        }))
  return [...(camada.fundo ? da(CAMADAS[camada.fundo], false) : []), ...da(camada, true)]
}
const ZOOM_MAXIMO = (c: Camada) => (c.blocos ? 19 : 13)
const ZOOM_MINIMO = 1.2
export const limiteDeZoom = (c: Camada) => (c.blocos ? 18.5 : c.nivelMaximo + 1.5)

export function MapaTerra({
  ponto,
  visao,
  camada,
  data,
  opacidade = 1,
  sobreposicoes,
  aoClicar,
  aoMover,
  aoClicarEvento,
  aoClicarSatelite,
  aoPassarDoLimite,
  className,
  controles = true,
  rotulos = true,
}: Props) {
  const elemento = useRef<HTMLDivElement>(null)
  const mapa = useRef<MapaML | null>(null)
  const marcador = useRef<Marker | null>(null)
  const [pronto, setPronto] = useState(false)
  const [globo, setGlobo] = useState(true)
  const [zoomAtual, setZoomAtual] = useState(visao.zoom)
  const trilha = useRef<HTMLSpanElement>(null)
  const nivel = useRef<HTMLSpanElement>(null)
  const medidor = useRef<HTMLDivElement>(null)
  const cbs = useRef({ aoClicar, aoMover, aoClicarEvento, aoClicarSatelite, aoPassarDoLimite })
  cbs.current = { aoClicar, aoMover, aoClicarEvento, aoClicarSatelite, aoPassarDoLimite }
  const camadaAtual = useRef(camada)
  camadaAtual.current = camada
  const idsAtivos = useRef<string[]>([])

  useEffect(() => {
    if (!elemento.current) return
    const m = new MapLibre({
      container: elemento.current,
      style: ESTILO,
      center: [visao.centro.lng, visao.centro.lat],
      zoom: Math.min(2.4, visao.zoom),
      minZoom: ZOOM_MINIMO,
      maxZoom: ZOOM_MAXIMO(camada),
      attributionControl: { compact: true },
      canvasContextAttributes: { alpha: true, antialias: false, powerPreference: "high-performance" } as never,
      pixelRatio: Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1 : 1.25),
      renderWorldCopies: false,
      fadeDuration: 60,
    })
    mapa.current = m

    m.on("error", (e) => {
      const msg = String((e as { error?: { message?: string } }).error?.message ?? "")
      if (!/AJAXError|Failed to fetch|(5dd)|(404)/.test(msg)) console.error(e.error)
    })

    m.on("load", () => {
      for (const id of ["faixas", "rastros", "eventos", "satelites"]) m.addSource(id, { type: "geojson", data: vazio })
      m.addLayer({
        id: "faixas",
        type: "fill",
        source: "faixas",
        paint: { "fill-color": "#ffb547", "fill-opacity": ["case", ["get", "ativo"], 0.2, 0.06] },
      })
      m.addLayer({
        id: "faixas-borda",
        type: "line",
        source: "faixas",
        paint: { "line-color": "#ffb547", "line-width": 1, "line-opacity": ["case", ["get", "ativo"], 0.9, 0.3] },
      })
      m.addLayer({
        id: "rastros",
        type: "line",
        source: "rastros",
        layout: { "line-cap": "round" },
        paint: {
          "line-color": ["case", ["get", "ativo"], "#ff5a1f", "#ffffff"],
          "line-width": ["case", ["get", "ativo"], 3, 1.2],
          "line-opacity": ["case", ["get", "ativo"], 1, 0.4],
        },
      })
      m.addLayer({
        id: "eventos",
        type: "circle",
        source: "eventos",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 4, 8, 8],
          "circle-color": ["get", "cor"],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1.5,
        },
      })
      m.addLayer({
        id: "satelites",
        type: "circle",
        source: "satelites",
        paint: {
          "circle-radius": ["case", ["get", "ativo"], 8, 5],
          "circle-color": ["case", ["get", "ativo"], "#ff5a1f", "#ffffff"],
          "circle-stroke-color": ["case", ["get", "ativo"], "#ffffff", "#ff5a1f"],
          "circle-stroke-width": 2,
        },
      })
      m.addLayer({
        id: "satelites-nome",
        type: "symbol",
        source: "satelites",
        layout: { "text-field": ["get", "nome"], "text-size": 11, "text-offset": [0, 1.3], "text-optional": true },
        paint: { "text-color": "#ffffff", "text-halo-color": "#05060a", "text-halo-width": 1.5 },
      })

      for (const id of ["eventos", "satelites"]) {
        m.on("mouseenter", id, () => {
          m.getCanvas().style.cursor = "pointer"
        })
        m.on("mouseleave", id, () => {
          m.getCanvas().style.cursor = ""
        })
      }
      m.on("click", "eventos", (e) => {
        const id = e.features?.[0]?.properties?.id
        if (id) cbs.current.aoClicarEvento?.(String(id))
        e.preventDefault()
      })
      m.on("click", "satelites", (e) => {
        const id = e.features?.[0]?.properties?.id
        if (id) cbs.current.aoClicarSatelite?.(String(id))
        e.preventDefault()
      })
      m.on("click", (e) => {
        if (e.defaultPrevented) return
        cbs.current.aoClicar?.({ lat: e.lngLat.lat, lng: e.lngLat.lng })
      })
      m.on("moveend", () => {
        const c = m.getCenter()
        cbs.current.aoMover?.({ lat: c.lat, lng: c.lng }, m.getZoom())
      })
      m.scrollZoom.setWheelZoomRate(1 / 100)
      m.scrollZoom.setZoomRate(1 / 60)
      const pintarNivel = () => {
        const z = m.getZoom()
        const f = Math.max(0, Math.min(1, (z - ZOOM_MINIMO) / (m.getMaxZoom() - ZOOM_MINIMO)))
        if (trilha.current) trilha.current.style.transform = `scaleY(${f})`
        if (nivel.current) nivel.current.textContent = z.toFixed(0)
        medidor.current?.setAttribute("aria-valuenow", z.toFixed(1))
      }
      m.on("zoom", pintarNivel)
      m.on("zoomend", () => setZoomAtual(m.getZoom()))
      m.on("zoomend", () => {
        const c = camadaAtual.current
        if (!c.blocos && m.getZoom() > limiteDeZoom(c)) cbs.current.aoPassarDoLimite?.()
      })
      setPronto(true)
      m.flyTo({ center: [visao.centro.lng, visao.centro.lat], zoom: visao.zoom, duration: 2400, essential: true })
    })

    return () => {
      m.remove()
      mapa.current = null
    }
  }, [])

  useEffect(() => {
    const m = mapa.current
    if (!m || !pronto) return
    for (const id of idsAtivos.current) {
      if (m.getLayer(id)) m.removeLayer(id)
      if (m.getSource(id)) m.removeSource(id)
    }
    const novos: string[] = []
    const antesDe = m.getLayer("faixas") ? "faixas" : undefined
    for (const f of fontesDaCamada(camada, data)) {
      m.addSource(f.id, { type: "raster", tiles: [f.url], tileSize: 256, maxzoom: f.maxzoom, attribution: f.atribuicao })
      m.addLayer(
        {
          id: f.id,
          type: "raster",
          source: f.id,
          paint: {
            "raster-opacity": f.principal ? opacidade : 1,
            "raster-fade-duration": 80,
            "raster-contrast": camada.blocos ? 0 : 0.16,
            "raster-saturation": camada.blocos ? 0 : 0.2,
            "raster-resampling": "linear",
          },
        },
        antesDe,
      )
      novos.push(f.id)
    }
    m.setMaxZoom(ZOOM_MAXIMO(camada))
    if (rotulos) {
      for (const r of ["rotulos"]) {
        if (m.getLayer(r)) m.removeLayer(r)
        m.addLayer({ id: r, type: "raster", source: r, paint: { "raster-opacity": 0.75, "raster-fade-duration": 0 } }, "faixas")
      }
    }
    idsAtivos.current = novos
  }, [camada, data, pronto, rotulos])

  useEffect(() => {
    const m = mapa.current
    if (!m || !pronto) return
    for (const f of fontesDaCamada(camada, "")) {
      if (f.principal && m.getLayer(f.id)) m.setPaintProperty(f.id, "raster-opacity", opacidade)
    }
  }, [opacidade, camada, pronto])

  const ultimaVisao = useRef(visao)
  useEffect(() => {
    const m = mapa.current
    if (!m || !pronto) return
    const a = ultimaVisao.current
    ultimaVisao.current = visao
    const mudou =
      Math.abs(a.centro.lat - visao.centro.lat) > 1e-4 ||
      Math.abs(a.centro.lng - visao.centro.lng) > 1e-4 ||
      Math.abs(a.zoom - visao.zoom) > 0.01
    if (mudou) m.flyTo({ center: [visao.centro.lng, visao.centro.lat], zoom: visao.zoom, duration: 1600, essential: true })
  }, [visao, pronto])

  useEffect(() => {
    const m = mapa.current
    if (!m) return
    if (!ponto) {
      marcador.current?.remove()
      marcador.current = null
      return
    }
    if (!marcador.current) {
      const el = document.createElement("div")
      el.className = "marcador-gatelite"
      el.innerHTML = '<span class="marcador-gatelite__pulso"></span><span class="marcador-gatelite__ponto"></span>'
      marcador.current = new Marker({ element: el }).setLngLat([ponto.lng, ponto.lat]).addTo(m)
    } else {
      marcador.current.setLngLat([ponto.lng, ponto.lat])
    }
  }, [ponto])

  useEffect(() => {
    const m = mapa.current
    if (!m || !pronto) return
    const anel = (pts: readonly LatLng[]) => {
      const c = pts.map((p) => [p.lng, p.lat])
      return [...c, c[0] ?? [0, 0]]
    }
    fonte(m, "faixas")?.setData({
      type: "FeatureCollection",
      features: (sobreposicoes?.faixas ?? [])
        .filter((f) => f.poligono.length > 2)
        .map((f) => ({
          type: "Feature",
          properties: { ativo: Boolean(f.ativo) },
          geometry: { type: "Polygon", coordinates: [anel(f.poligono)] },
        })),
    })
    fonte(m, "rastros")?.setData({
      type: "FeatureCollection",
      features: (sobreposicoes?.rastros ?? []).map((r) => ({
        type: "Feature",
        properties: { ativo: Boolean(r.ativo) },
        geometry: { type: "LineString", coordinates: r.pontos.map((p) => [p.lng, p.lat]) },
      })),
    })
    fonte(m, "eventos")?.setData({
      type: "FeatureCollection",
      features: (sobreposicoes?.eventos ?? []).map((e) => ({
        type: "Feature",
        properties: { id: e.id, cor: COR_DA_CATEGORIA[e.categoria], titulo: e.titulo },
        geometry: { type: "Point", coordinates: [e.lng, e.lat] },
      })),
    })
    fonte(m, "satelites")?.setData({
      type: "FeatureCollection",
      features: (sobreposicoes?.satelites ?? []).map((s) => ({
        type: "Feature",
        properties: { id: s.id, nome: s.nome, ativo: Boolean(s.ativo) },
        geometry: { type: "Point", coordinates: [s.lng, s.lat] },
      })),
    })
  }, [sobreposicoes, pronto])

  const zoom = (d: number) => mapa.current?.easeTo({ zoom: (mapa.current?.getZoom() ?? 5) + d, duration: 220 })
  const centro = () => (ponto ? ([ponto.lng, ponto.lat] as [number, number]) : mapa.current?.getCenter())
  const maximo = limiteDeZoom(camada)
  const fracao = Math.max(0, Math.min(1, (zoomAtual - ZOOM_MINIMO) / (ZOOM_MAXIMO(camada) - ZOOM_MINIMO)))
  const alternarProjecao = () => {
    const m = mapa.current
    if (!m) return
    m.setProjection({ type: globo ? "mercator" : "globe" })
    setGlobo(!globo)
    if (m.getZoom() > 3) m.easeTo({ zoom: 2.2, duration: 900 })
  }

  return (
    <div className={cn("estrelas relative h-full w-full overflow-hidden bg-[#05060a]", className)}>
      <div ref={elemento} style={{ position: "absolute", inset: 0 }} role="application" aria-label="Mapa de imagens de satélite" />
      {controles && (
        <div className="absolute top-1/2 right-3 z-10 flex -translate-y-1/2 flex-col items-center gap-1 rounded-xl border border-white/10 bg-[#0b0e15]/80 p-1 text-white shadow-flutuante md:right-5">
          <BotaoDoMapa rotulo="Aproximar" onClick={() => zoom(1)} disabled={zoomAtual >= ZOOM_MAXIMO(camada) - 0.01}>
            <IconPlus className="size-[18px]" stroke={1.5} />
          </BotaoDoMapa>
          <div
            className="relative my-1 h-20 w-1 overflow-hidden rounded-full bg-white/10"
            role="meter"
            aria-label="Nível de zoom"
            aria-valuemin={ZOOM_MINIMO}
            aria-valuemax={ZOOM_MAXIMO(camada)}
            aria-valuenow={Number(zoomAtual.toFixed(1))}
            ref={medidor}
          >
            <span
              ref={trilha}
              className="absolute inset-x-0 bottom-0 h-full origin-bottom rounded-full bg-white will-change-transform"
              style={{ transform: `scaleY(${fracao})` }}
            />
          </div>
          <span ref={nivel} className="numero text-[10px] text-white/60">
            {zoomAtual.toFixed(0)}
          </span>
          <BotaoDoMapa rotulo="Afastar" onClick={() => zoom(-1)} disabled={zoomAtual <= ZOOM_MINIMO + 0.01}>
            <IconMinus className="size-[18px]" stroke={1.5} />
          </BotaoDoMapa>
          <span className="my-0.5 h-px w-6 bg-white/10" aria-hidden />
          <BotaoDoMapa
            rotulo="Zoom máximo desta camada"
            onClick={() => {
              const c = centro()
              if (c) mapa.current?.flyTo({ center: c, zoom: camada.blocos ? 18 : maximo - 0.5, duration: 1600 })
            }}
          >
            <IconZoomIn className="size-[18px]" stroke={1.5} />
          </BotaoDoMapa>
          <BotaoDoMapa rotulo="Ver o planeta inteiro" onClick={() => mapa.current?.flyTo({ zoom: 1.6, duration: 1600 })}>
            <IconZoomOut className="size-[18px]" stroke={1.5} />
          </BotaoDoMapa>
          <BotaoDoMapa
            rotulo="Voltar ao lugar"
            onClick={() => ponto && mapa.current?.flyTo({ center: [ponto.lng, ponto.lat], zoom: Math.max(8, Math.min(maximo - 0.5, mapa.current.getZoom())), duration: 1200 })}
          >
            <IconCurrentLocation className="size-[18px]" stroke={1.5} />
          </BotaoDoMapa>
          <BotaoDoMapa rotulo={globo ? "Ver em mapa plano" : "Ver em globo"} onClick={alternarProjecao}>
            {globo ? <IconMap2 className="size-[18px]" stroke={1.5} /> : <IconWorld className="size-[18px]" stroke={1.5} />}
          </BotaoDoMapa>
        </div>
      )}
    </div>
  )
}

function BotaoDoMapa({
  rotulo,
  children,
  ...props
}: { rotulo: string; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      title={rotulo}
      className="grid size-10 place-items-center rounded-xl transition-colors hover:bg-white/15 disabled:pointer-events-none disabled:opacity-30"
      {...props}
    >
      {children}
    </button>
  )
}
