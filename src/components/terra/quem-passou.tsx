"use client"

import { IconArrowUpRight, IconCurrentLocation, IconMoon, IconSun } from "@tabler/icons-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { GraficoDeListras } from "@/components/graficos/listras"
import { fusoPelaLongitude, horaLocal } from "@/domain/sol"
import { numero } from "@/lib/formato"
import { cn } from "@/lib/utils"
import { usePassagens } from "./use-passagens"

const CIDADES = [
  { nome: "Brasília", lat: -15.794, lng: -47.883 },
  { nome: "São Paulo", lat: -23.55, lng: -46.633 },
  { nome: "Manaus", lat: -3.119, lng: -60.022 },
  { nome: "Recife", lat: -8.054, lng: -34.881 },
  { nome: "Porto Alegre", lat: -30.035, lng: -51.218 },
]

export function QuemPassou() {
  const [lugar, setLugar] = useState<{ nome: string; lat: number; lng: number }>(CIDADES[0]!)
  const [agora, setAgora] = useState<number | null>(null)
  useEffect(() => setAgora(Date.now()), [])
  const { passagens, carregando, erro } = usePassagens(lugar, agora ?? 0, 24, 0)
  const cobertas = agora ? passagens.filter((p) => p.dentroDaFaixa) : []
  const fuso = fusoPelaLongitude(lugar.lng)

  const horas = Array.from({ length: 24 }, (_, i) => {
    const t0 = (agora ?? 0) - (24 - i) * 3_600_000
    const n = cobertas.filter((p) => p.t >= t0 && p.t < t0 + 3_600_000).length
    return { valor: n / 3, rotulo: `${horaLocal(t0, fuso)} · ${n} satélite(s)`, apagada: n === 0 }
  })

  const meEncontrar = () => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setLugar({ nome: "Você", lat: p.coords.latitude, lng: p.coords.longitude }),
      () => toast.error("Sem permissão de localização. Escolha uma cidade."),
    )
  }

  return (
    <div className="cartao-vitrine p-5 text-left sm:p-8">
      <div className="flex flex-wrap gap-2">
        {CIDADES.map((c) => (
          <button
            key={c.nome}
            type="button"
            onClick={() => setLugar(c)}
            aria-pressed={lugar.nome === c.nome}
            className={cn(
              "h-9 shrink-0 rounded-lg border px-3.5 text-sm transition-colors",
              lugar.nome === c.nome ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
            )}
          >
            {c.nome}
          </button>
        ))}
        <button
          type="button"
          onClick={meEncontrar}
          aria-pressed={lugar.nome === "Você"}
          className={cn(
            "flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3.5 text-sm transition-colors",
            lugar.nome === "Você" ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
          )}
        >
          <IconCurrentLocation className="size-4" stroke={1.5} /> Onde eu estou
        </button>
      </div>

      <div className="mt-10 text-center">
        <span className="titulo-display block text-[5.5rem] leading-none font-semibold">{carregando || !agora ? "–" : cobertas.length}</span>
        <span className="mt-3 block text-[15px] text-white/60">
          passagens com {lugar.nome === "Você" ? "você" : lugar.nome} dentro da faixa nas últimas 24 h
        </span>
      </div>

      <div className="mt-5">
        <GraficoDeListras dados={horas} altura={56} rotuloAcessivel="Satélites cobrindo o lugar a cada hora" minimo={0.08} />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>24 h atrás</span>
          <span>agora</span>
        </div>
      </div>

      {erro && <p className="mt-4 text-sm text-destructive">{erro.message}</p>}

      <ul className="mt-5 divide-y border-t">
        {cobertas
          .slice()
          .reverse()
          .slice(0, 5)
          .map((p) => (
            <li key={p.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3 text-sm">
              <span>
                <span className="font-medium">{p.sat.nome}</span>{" "}
                <span className="text-muted-foreground">· {p.sat.sensor} · {p.sat.resolucaoM} m</span>
              </span>
              <span className="text-muted-foreground" title={p.deDia ? "Com luz do Sol: saiu foto" : "De noite: sensor óptico não vê cor"}>
                {p.deDia ? <IconSun className="size-4 text-sol" stroke={1.5} /> : <IconMoon className="size-4" stroke={1.5} />}
              </span>
              <span className="numero w-14 text-right">{horaLocal(p.t, fuso)}</span>
            </li>
          ))}
        {carregando && <li className="py-3 text-sm text-muted-foreground">Calculando as órbitas de hoje…</li>}
      </ul>

      <Link
        href={`/explorar?lat=${lugar.lat.toFixed(3)}&lng=${lugar.lng.toFixed(3)}&aba=satelites`}
        className="magnetico mt-6 flex min-h-14 w-full flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-4 py-3 text-center rounded-2xl bg-[#f4f3f1] text-[15px] font-semibold text-[#0e0e12] transition-colors hover:bg-white"
      >
        Ver todas no mapa <IconArrowUpRight className="size-4" stroke={1.5} />
      </Link>
      <p className="mt-3 text-center text-xs text-white/45">
        {numero(cobertas.length ? cobertas.filter((p) => p.deDia).length : 0)} delas com luz do Sol. Hora solar local.
      </p>
    </div>
  )
}
