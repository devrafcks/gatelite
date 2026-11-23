"use client"

import { IconCloud, IconSparkles, IconSunrise, IconSunset } from "@tabler/icons-react"
import { useEffect, useMemo, useState } from "react"
import { caixaAoRedor, type LatLng } from "@/domain/geo"
import { urlDaImagem } from "@/domain/gibs"
import { diaMaisLimpo, fracaoDeNuvem } from "@/domain/nuvens"
import { fusoPelaLongitude, horaLocal, solDoDia, somarDias } from "@/domain/sol"
import { cn } from "@/lib/utils"
import { Bloco } from "./pecas"

const DIAS = 14
const CAMADA_DIARIA = "VIIRS_NOAA20_CorrectedReflectance_TrueColor"
const diaCurto = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`)
  return {
    semana: d.toLocaleDateString("pt-BR", { weekday: "short", timeZone: "UTC" }).replace(".", ""),
    dia: iso.slice(8, 10),
  }
}

// Mede a nuvem de cada miniatura num canvas (o GIBS libera CORS). 64 px bastam para a conta.
const medir = (url: string, sinal: { cancelado: boolean }) =>
  new Promise<number | null>((ok) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      if (sinal.cancelado) return ok(null)
      const c = document.createElement("canvas")
      c.width = c.height = 64
      const g = c.getContext("2d", { willReadFrequently: true })
      if (!g) return ok(null)
      g.drawImage(img, 0, 0, 64, 64)
      ok(fracaoDeNuvem(g.getImageData(0, 0, 64, 64).data))
    }
    img.onerror = () => ok(null)
    img.src = url
  })

// Os últimos 14 dias do lugar lado a lado, com quanto de nuvem cada um tinha, e um atalho
// para o dia mais limpo. Mais o nascer e o pôr do Sol do dia que está no mapa.
export function DiasLimpos({
  lugar,
  ultimo,
  data,
  aoEscolher,
}: {
  lugar: LatLng
  /** o dia mais recente com mosaico completo */
  ultimo: string
  /** o dia que está no mapa */
  data: string
  aoEscolher: (dia: string) => void
}) {
  const dias = useMemo(() => Array.from({ length: DIAS }, (_, i) => somarDias(ultimo, -i)), [ultimo])
  // arredonda o ponto para não refazer as 14 medições a cada clique vizinho
  const lat = Number(lugar.lat.toFixed(2))
  const lng = Number(lugar.lng.toFixed(2))
  const caixa = useMemo(() => caixaAoRedor({ lat, lng }, 30), [lat, lng])
  const urls = useMemo(() => dias.map((d) => urlDaImagem(CAMADA_DIARIA, d, caixa, 128, 128)), [dias, caixa])
  const [nuvens, setNuvens] = useState<Record<string, number | null>>({})

  useEffect(() => {
    const sinal = { cancelado: false }
    setNuvens({})
    // três por vez: rápido sem afogar a conexão
    let proximo = 0
    const trabalhar = async () => {
      while (!sinal.cancelado && proximo < dias.length) {
        const i = proximo++
        const n = await medir(urls[i] as string, sinal)
        if (!sinal.cancelado) setNuvens((s) => ({ ...s, [dias[i] as string]: n }))
      }
    }
    void Promise.all([trabalhar(), trabalhar(), trabalhar()])
    return () => {
      sinal.cancelado = true
    }
  }, [urls, dias])

  const medidos = dias.filter((d) => d in nuvens).length
  const melhor = diaMaisLimpo(dias.map((d) => ({ dia: d, nuvem: nuvens[d] ?? null })))
  const fuso = fusoPelaLongitude(lugar.lng)
  const sol = useMemo(() => solDoDia(data, lugar.lat, lugar.lng), [data, lugar.lat, lugar.lng])
  const duracao = sol.duracaoMin

  return (
    <>
      <Bloco
        titulo="Últimos 14 dias"
        acao={
          medidos < DIAS ? (
            <span className="numero text-xs text-muted-foreground">
              {medidos}/{DIAS}
            </span>
          ) : undefined
        }
      >
        <div className="grid grid-cols-7 gap-1.5">
          {dias.map((d, i) => {
            const n = nuvens[d]
            const ativo = d === data
            const eMelhor = melhor?.dia === d
            const { semana, dia } = diaCurto(d)
            return (
              <button
                key={d}
                type="button"
                onClick={() => aoEscolher(d)}
                aria-pressed={ativo}
                aria-label={`${d.split("-").reverse().join("/")}${n == null ? "" : `, ${Math.round(n * 100)}% de nuvem`}`}
                className="group min-w-0 text-left"
              >
                <span
                  className={cn(
                    "relative block aspect-square overflow-hidden rounded-lg bg-noite ring-1 ring-white/10 transition",
                    ativo && "ring-2 ring-sol",
                    !ativo && "group-hover:ring-white/30",
                  )}
                >
                  {/* biome-ignore lint/performance/noImgElement: miniaturas externas do GIBS */}
                  <img src={urls[i]} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  {eMelhor && (
                    <span className="absolute top-0.5 right-0.5 grid size-4 place-items-center rounded-full bg-sol text-[#0e0e12]">
                      <IconSparkles className="size-2.5" stroke={2} />
                    </span>
                  )}
                </span>
                <span className="mt-1 flex items-baseline justify-between gap-1 text-[10px] leading-none">
                  <span className={cn("capitalize", ativo ? "text-foreground" : "text-muted-foreground")}>
                    {semana} {dia}
                  </span>
                </span>
                <span
                  className={cn(
                    "numero mt-0.5 block text-[10px] leading-none",
                    n == null ? "text-muted-foreground/50" : n < 0.2 ? "text-[#7ddc9b]" : n < 0.55 ? "text-ambar" : "text-muted-foreground",
                  )}
                >
                  {d in nuvens ? (n == null ? "sem dado" : `${Math.round(n * 100)}%`) : "…"}
                </span>
              </button>
            )
          })}
        </div>
        {melhor && melhor.nuvem !== null && (
          <button
            type="button"
            onClick={() => aoEscolher(melhor.dia)}
            disabled={melhor.dia === data}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-sol/40 bg-sol/[0.07] px-4 py-3 text-left text-sm transition-colors hover:bg-sol/[0.12] disabled:cursor-default disabled:opacity-70"
          >
            <span className="flex items-center gap-2">
              <IconSparkles className="size-4 shrink-0 text-sol" stroke={1.5} />
              <span>
                {melhor.dia === data ? "Você já está no dia mais limpo" : "Ver o dia mais limpo"}
                <span className="block text-xs text-muted-foreground">
                  {melhor.dia.split("-").reverse().join("/")}, cerca de {Math.round(melhor.nuvem * 100)}% de nuvem
                </span>
              </span>
            </span>
            <IconCloud className="size-4 shrink-0 text-muted-foreground" stroke={1.5} />
          </button>
        )}
        <p className="text-xs leading-relaxed text-muted-foreground">
          Estimativa pela cor de uma área de 60 km em volta do ponto. Neve e gelo também contam como nuvem.
        </p>
      </Bloco>

      <Bloco titulo="O Sol nesse dia">
        <dl className="grid grid-cols-3 gap-3">
          <div className="border-t border-white/10 pt-3">
            <dt className="flex items-center gap-1 text-xs text-muted-foreground">
              <IconSunrise className="size-3.5 text-ambar" stroke={1.5} /> Nascer
            </dt>
            <dd className="numero mt-1 text-[1.2rem]">{sol.nascer ? horaLocal(sol.nascer, fuso) : "–"}</dd>
          </div>
          <div className="border-t border-white/10 pt-3">
            <dt className="flex items-center gap-1 text-xs text-muted-foreground">
              <IconSunset className="size-3.5 text-sol" stroke={1.5} /> Pôr
            </dt>
            <dd className="numero mt-1 text-[1.2rem]">{sol.por ? horaLocal(sol.por, fuso) : "–"}</dd>
          </div>
          <div className="border-t border-white/10 pt-3">
            <dt className="text-xs text-muted-foreground">Dia de</dt>
            <dd className="numero mt-1 text-[1.2rem]">
              {duracao ? `${Math.floor(duracao / 60)}h${String(Math.round(duracao % 60)).padStart(2, "0")}` : "–"}
            </dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground">Hora solar do lugar, calculada pela longitude.</p>
      </Bloco>
    </>
  )
}
