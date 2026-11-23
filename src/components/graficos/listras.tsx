"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

export type Listra = { readonly valor: number; readonly rotulo?: string; readonly destaque?: boolean; readonly apagada?: boolean }

export function GraficoDeListras({
  dados,
  altura = 96,
  className,
  marcador,
  rotuloAcessivel,
  cor = "sol",
  minimo = 0.04,
}: {
  dados: readonly Listra[]
  altura?: number
  className?: string
  marcador?: number | null
  rotuloAcessivel: string
  cor?: "sol" | "noite" | "tinta"
  minimo?: number
}) {
  const id = useId()
  const n = dados.length
  const largura = 1000
  const passo = largura / Math.max(n, 1)
  const espessura = Math.max(1.5, Math.min(passo * 0.45, 7))
  const paradas =
    cor === "sol"
      ? ["var(--ambar)", "var(--sol)", "var(--rosa)"]
      : cor === "noite"
        ? ["#8aa0d6", "#4a5c9e", "var(--noite)"]
        : ["var(--muted-foreground)", "var(--foreground)", "var(--foreground)"]

  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      preserveAspectRatio="none"
      className={cn("w-full", className)}
      style={{ height: altura }}
      role="img"
      aria-label={rotuloAcessivel}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={paradas[0]} />
          <stop offset="0.55" stopColor={paradas[1]} />
          <stop offset="1" stopColor={paradas[2]} />
        </linearGradient>
      </defs>
      {dados.map((d, i) => {
        const v = Math.max(minimo, Math.min(1, d.valor))
        const h = v * (altura - 2)
        const x = i * passo + passo / 2
        return (
          <rect
            key={`${i}-${d.rotulo ?? ""}`}
            x={x - espessura / 2}
            y={altura - h}
            width={espessura}
            height={h}
            rx={espessura / 2}
            fill={d.apagada ? "var(--border)" : `url(#${id})`}
            opacity={d.apagada ? 1 : d.destaque === false ? 0.35 : 1}
          >
            {d.rotulo && <title>{d.rotulo}</title>}
          </rect>
        )
      })}
      {marcador != null && marcador >= 0 && marcador < n && (
        <line
          x1={marcador * passo + passo / 2}
          x2={marcador * passo + passo / 2}
          y1={0}
          y2={altura}
          stroke="var(--foreground)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  )
}
