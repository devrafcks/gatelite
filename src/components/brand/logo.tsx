import { useId } from "react"
import { cn } from "@/lib/utils"
import { CORES, LOGOTIPO, SIMBOLO } from "./marca-dados"

// O gato sentado no planeta, olhando a estrela. Desenhado a partir dos mesmos dados que
// geram os SVGs da marca (scripts/gerar-marca.mjs).
export function DesenhoDoSimbolo({ cor = "currentColor", id }: { cor?: string; id: string }) {
  const S = SIMBOLO
  return (
    <>
      <defs>
        <clipPath id={`${id}p`}>
          <circle cx={S.planeta.cx} cy={S.planeta.cy} r={S.planeta.r} />
        </clipPath>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
          <rect width="120" height="120" fill="#fff" />
          <path d={S.listras} stroke="#000" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        </mask>
      </defs>
      <g clipPath={`url(#${id}p)`} fill={cor}>
        {S.faixas.map((y) => (
          <rect key={y} x="20" y={y} width="80" height={S.faixaAltura} rx={S.faixaAltura / 2} />
        ))}
      </g>
      <g fill={cor} mask={`url(#${id}m)`}>
        <path d={S.corpo} />
        <circle cx={S.cabeca.cx} cy={S.cabeca.cy} r={S.cabeca.r} />
        {S.orelhas.map((o) => (
          <path key={o} d={o} />
        ))}
      </g>
      <path d={S.rabo} fill="none" stroke={cor} strokeWidth="5.2" strokeLinecap="round" />
      <circle cx={S.raboPonta.cx} cy={S.raboPonta.cy} r={S.raboPonta.r} fill={cor} />
      <path d={S.estrela} fill={CORES.laranja} />
    </>
  )
}

export function Simbolo({ className, titulo = "Gatélite" }: { className?: string; titulo?: string }) {
  const id = `s${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("size-8", className)}
      role={titulo ? "img" : undefined}
      aria-label={titulo || undefined}
      aria-hidden={titulo ? undefined : true}
    >
      <DesenhoDoSimbolo id={id} />
    </svg>
  )
}

export function Logotipo({ className }: { className?: string }) {
  const altura = LOGOTIPO.base - LOGOTIPO.topo
  return (
    <svg viewBox={`0 ${LOGOTIPO.topo - 1} ${LOGOTIPO.largura + 2} ${altura + 2}`} className={cn("h-5 w-auto", className)} aria-hidden>
      <g transform="translate(1 0)">
        <path d={LOGOTIPO.d} fill="currentColor" />
        <path d={LOGOTIPO.destaque} fill={CORES.laranja} />
      </g>
    </svg>
  )
}

export function Logo({ className, compacto = false }: { className?: string; compacto?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Simbolo className="size-8 -translate-y-px" titulo="" />
      {!compacto && <Logotipo className="h-[15px]" />}
      <span className="sr-only">Gatélite</span>
    </span>
  )
}
