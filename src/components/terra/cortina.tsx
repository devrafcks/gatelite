"use client"

import { IconArrowsHorizontal } from "@tabler/icons-react"
import { useRef } from "react"
import { cn } from "@/lib/utils"

export function Cortina({
  antes,
  depois,
  rotuloAntes,
  rotuloDepois,
  className,
  proporcao = "3 / 2",
}: {
  antes: string
  depois: string
  rotuloAntes: string
  rotuloDepois: string
  className?: string
  proporcao?: string
}) {
  const caixa = useRef<HTMLDivElement>(null)
  const faixa = useRef<HTMLInputElement>(null)
  const quadro = useRef(0)

  const aplicar = (pos: number) => {
    caixa.current?.style.setProperty("--pos", `${pos}%`)
    if (faixa.current) faixa.current.value = String(Math.round(pos))
  }
  const mover = (clientX: number) => {
    const r = caixa.current?.getBoundingClientRect()
    if (!r) return
    const pos = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100))
    cancelAnimationFrame(quadro.current)
    quadro.current = requestAnimationFrame(() => aplicar(pos))
  }

  return (
    <div
      ref={caixa}
      className={cn("group/cortina relative touch-pan-y overflow-hidden rounded-2xl bg-noite select-none", className)}
      style={{ aspectRatio: proporcao, ["--pos" as string]: "50%" }}
      onPointerDown={(e) => {
        mover(e.clientX)
        ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
      }}
      onPointerMove={(e) => e.buttons === 1 && mover(e.clientX)}
    >
      <img
        src={depois}
        alt={rotuloDepois}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0" style={{ clipPath: "inset(0 calc(100% - var(--pos)) 0 0)" }}>
        <img
          src={antes}
          alt={rotuloAntes}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      </div>
      <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white/90" style={{ left: "var(--pos)" }}>
        <span className="absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl bg-white text-tinta shadow-flutuante transition-transform duration-200 group-active/cortina:scale-90">
          <IconArrowsHorizontal className="size-5" stroke={1.5} />
        </span>
      </div>
      <span className="numero absolute top-3 left-3 rounded-lg bg-black/55 px-3 py-1 text-xs text-white backdrop-blur">{rotuloAntes}</span>
      <span className="numero absolute top-3 right-3 rounded-lg bg-black/55 px-3 py-1 text-xs text-white backdrop-blur">{rotuloDepois}</span>
      <input
        ref={faixa}
        type="range"
        min={0}
        max={100}
        defaultValue={50}
        onChange={(e) => aplicar(Number(e.target.value))}
        aria-label="Posição da cortina entre antes e depois"
        className="sr-only"
      />
    </div>
  )
}
