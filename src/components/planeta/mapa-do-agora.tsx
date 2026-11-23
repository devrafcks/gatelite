"use client"

import { IconMoon, IconSatellite, IconSun } from "@tabler/icons-react"
import { useEffect, useMemo, useState } from "react"
import { COR_DA_CATEGORIA } from "@/components/terra/icone-evento"
import { CATEGORIAS } from "@/domain/eventos"
import { dataCompleta, urlDaImagem } from "@/domain/gibs"
import { posicaoEm } from "@/domain/orbitas"
import { luaDoMomento } from "@/domain/lua"
import { poligonoDaNoite, pontoSubsolar } from "@/domain/terminador"
import { useEventos, useFrota } from "@/lib/consultas"
import { coordenada, numero } from "@/lib/formato"
import { useImagemSemPreto } from "@/lib/sem-preto"
import { cn } from "@/lib/utils"

// O planeta agora, num mapa-múndi: o mosaico de ontem da NASA de dia, as luzes das cidades
// onde já é noite, a linha que separa os dois andando de verdade, o ponto onde o Sol está
// a pino, os satélites e os eventos ativos.
const L = 1440
const A = 720
const MUNDO = { sul: -90, norte: 90, oeste: -180, leste: 180 }
const x = (lng: number) => ((lng + 180) / 360) * L
const y = (lat: number) => ((90 - lat) / 180) * A
const caminho = (pts: [number, number][]) => `M${pts.map(([lng, lat]) => `${x(lng).toFixed(1)} ${y(lat).toFixed(1)}`).join("L")}Z`

export function MapaDoAgora() {
  const [agora, setAgora] = useState<Date | null>(null)
  const [camada, setCamada] = useState<"tudo" | "satelites" | "eventos">("tudo")
  const { frota } = useFrota()
  const eventos = useEventos()

  useEffect(() => {
    setAgora(new Date())
    const id = setInterval(() => setAgora(new Date()), 5000)
    return () => clearInterval(id)
  }, [])

  // o último dia com o mosaico completo (o de ontem ainda tem as Américas faltando de madrugada)
  const ontem = agora ? dataCompleta(agora) : null
  // VIIRS (NOAA-20): faixa de 3 mil km, sem os vãos pretos entre as órbitas do MODIS.
  // O Blue Marble por baixo cobre só a noite polar, onde não há imagem.
  const base = urlDaImagem("BlueMarble_NextGeneration", "2004-08-01", MUNDO, 1440, 720)
  const dia = useImagemSemPreto(ontem ? urlDaImagem("VIIRS_NOAA20_CorrectedReflectance_TrueColor", ontem, MUNDO, 1200, 600, "png") : null)
  const luzes = urlDaImagem("VIIRS_Black_Marble", "2016-01-01", MUNDO, 1440, 720)

  const minuto = agora ? Math.floor(agora.getTime() / 60_000) : 0
  const sol = useMemo(() => (agora ? pontoSubsolar(agora) : null), [minuto])
  const noite = useMemo(() => (agora ? caminho(poligonoDaNoite(agora, 0)) : ""), [minuto])
  const noiteFunda = useMemo(() => (agora ? caminho(poligonoDaNoite(agora, -12)) : ""), [minuto])
  const lua = useMemo(() => (agora ? luaDoMomento(agora) : null), [minuto])

  const posicoes = agora
    ? frota.flatMap((f) => {
        const p = posicaoEm(f.satrec, agora)
        return p ? [{ ...p, nome: f.sat.nome, norad: f.sat.norad }] : []
      })
    : []
  const listaEventos = eventos.data?.eventos ?? []

  // rótulo só para quem não cai em cima de outro já escrito (ordem: o mais ao norte primeiro)
  const comRotulo = new Set<number>()
  const ocupados: { x: number; y: number; w: number }[] = []
  for (const p of [...posicoes].sort((a, b) => b.lat - a.lat)) {
    const px = x(p.lng) + 9
    const py = y(p.lat) - 8
    const w = p.nome.length * 8 + 6
    if (px + w > L - 4) continue
    if (ocupados.some((o) => px < o.x + o.w && o.x < px + w && Math.abs(o.y - py) < 20)) continue
    ocupados.push({ x: px, y: py, w })
    comRotulo.add(p.norad)
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#05060a]">
        <svg viewBox={`0 0 ${L} ${A}`} className="block w-full" role="img" aria-label="Mapa-múndi com o lado do dia, o lado da noite e as luzes das cidades agora">
          <defs>
            <filter id="borda-macia" x="-5%" y="-5%" width="110%" height="110%">
              <feGaussianBlur stdDeviation="9" />
            </filter>
            <mask id="mascara-noite" maskUnits="userSpaceOnUse" x="0" y="0" width={L} height={A}>
              <rect width={L} height={A} fill="#000" />
              <path d={noite} fill="#fff" filter="url(#borda-macia)" />
            </mask>
          </defs>

          <rect width={L} height={A} fill="#0c1124" />
          <image href={base} width={L} height={A} preserveAspectRatio="none" opacity="0.7" />
          {dia && <image href={dia} width={L} height={A} preserveAspectRatio="none" />}
          {/* a noite: escurece o dia e acende as cidades, com a borda do crepúsculo macia */}
          <g mask="url(#mascara-noite)">
            <rect width={L} height={A} fill="#020308" opacity="0.82" />
            <image href={luzes} width={L} height={A} preserveAspectRatio="none" style={{ mixBlendMode: "screen" }} />
          </g>
          <path d={noiteFunda} fill="#020308" opacity="0.18" filter="url(#borda-macia)" />

          {/* grade leve: equador e trópicos */}
          {[0, 23.44, -23.44].map((lat) => (
            <line key={lat} x1="0" x2={L} y1={y(lat)} y2={y(lat)} stroke="#fff" strokeOpacity={lat === 0 ? 0.18 : 0.08} strokeDasharray="4 8" />
          ))}

          {(camada === "tudo" || camada === "eventos") &&
            listaEventos.map((e) => (
              <circle key={e.id} cx={x(e.lng)} cy={y(e.lat)} r="3" fill={COR_DA_CATEGORIA[e.categoria]} fillOpacity="0.9" stroke="#05060a" strokeOpacity="0.6" strokeWidth="1">
                <title>
                  {CATEGORIAS[e.categoria].singular}: {e.titulo}
                </title>
              </circle>
            ))}

          {(camada === "tudo" || camada === "satelites") &&
            posicoes.map((p) => (
              <g key={p.norad} transform={`translate(${x(p.lng)} ${y(p.lat)})`}>
                <circle r="9" fill="#ff5a1f" opacity="0.18" />
                <circle r="4" fill="#ffb547" stroke="#fff" strokeWidth="1.5" />
                {comRotulo.has(p.norad) ? (
                  <text x="9" y="-8" fontSize="14" fill="#fff" fillOpacity="0.9" fontFamily="var(--font-geist-sans)" paintOrder="stroke" stroke="#05060a" strokeOpacity="0.55" strokeWidth="3">
                    {p.nome}
                  </text>
                ) : (
                  <title>{p.nome}</title>
                )}
              </g>
            ))}

          {sol && (
            <g transform={`translate(${x(sol.lng)} ${y(sol.lat)})`}>
              <circle r="22" fill="#ffb547" opacity="0.16" />
              <circle r="9" fill="#ffd27a" stroke="#fff" strokeWidth="2" />
              <title>Sol a pino</title>
            </g>
          )}
        </svg>

        <div className="absolute top-3 left-3 flex gap-1 rounded-xl border border-white/10 bg-black/50 p-1 text-xs text-white backdrop-blur">
          {(
            [
              ["tudo", "Tudo"],
              ["satelites", "Satélites"],
              ["eventos", "Eventos"],
            ] as const
          ).map(([id, r]) => (
            <button
              key={id}
              type="button"
              onClick={() => setCamada(id)}
              aria-pressed={camada === id}
              className={cn("h-8 rounded-lg px-3 transition-colors", camada === id ? "bg-white text-[#0e0e12]" : "hover:bg-white/10")}
            >
              {r}
            </button>
          ))}
        </div>
        {agora && (
          <span className="numero absolute top-4 right-4 rounded-lg bg-black/50 px-2.5 py-1 text-xs text-white/85 backdrop-blur">
            {agora.toISOString().slice(11, 16)} UTC
          </span>
        )}
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        <div className="border-t border-white/10 pt-4">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <IconSun className="size-4 text-ambar" stroke={1.5} /> Sol a pino agora
          </dt>
          <dd className="numero mt-2 text-xl">{sol ? coordenada(sol.lat, sol.lng) : "–"}</dd>
        </div>
        <div className="border-t border-white/10 pt-4">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <IconMoon className="size-4" stroke={1.5} /> {lua?.nome ?? "Lua"}
          </dt>
          <dd className="numero mt-2 text-xl">{lua ? `${numero(lua.iluminada * 100)}% iluminada` : "–"}</dd>
        </div>
        <div className="border-t border-white/10 pt-4">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <IconSatellite className="size-4" stroke={1.5} /> Satélites no lado do dia
          </dt>
          <dd className="numero mt-2 text-xl">
            {sol ? posicoes.filter((p) => cosAngulo(p, sol) > 0).length : "–"}
            <span className="font-sans text-sm text-muted-foreground"> de {posicoes.length || "–"}</span>
          </dd>
        </div>
        <div className="border-t border-white/10 pt-4">
          <dt className="text-xs text-muted-foreground">Eventos ativos no mapa</dt>
          <dd className="numero mt-2 text-xl">{eventos.data ? numero(listaEventos.length) : "–"}</dd>
        </div>
      </dl>
    </div>
  )
}

// cosseno do ângulo entre um ponto e o ponto subsolar: positivo = lado do dia
const cosAngulo = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const r = Math.PI / 180
  return (
    Math.sin(a.lat * r) * Math.sin(b.lat * r) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.cos((a.lng - b.lng) * r)
  )
}
