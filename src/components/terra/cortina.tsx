"use client"

import { IconArrowsHorizontal } from "@tabler/icons-react"
import { useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Antes e depois: duas imagens empilhadas, a de cima recortada por uma cortina arrastável.
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
  const [pos, setPos] = useState(50)
  const caixa = useRef<HTMLDivElement>(null)
  const mover = (clientX: number) => {
    const r = caixa.current?.getBoundingClientRect()
    if (!r) return
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)))
  }

  return (
    <div
      ref={caixa}
      className={cn("relative touch-pan-y overflow-hidden rounded-2xl bg-noite select-none", className)}
      style={{ aspectRatio: proporcao }}
      onPointerDown={(e) => {
        mover(e.clientX)
        ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      }}
      onPointerMove={(e) => e.buttons === 1 && mover(e.clientX)}
    >
      {/* biome-ignore lint/performance/noImgElement: imagens externas do GIBS */}
      <img src={depois} alt={rotuloDepois} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* biome-ignore lint/performance/noImgElement: imagens externas do GIBS */}
        <img src={antes} alt={rotuloAntes} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      </div>
      <div className="absolute inset-y-0 w-0.5 bg-white" style={{ left: `${pos}%` }}>
        <span className="absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl bg-white text-tinta shadow-flutuante">
          <IconArrowsHorizontal className="size-5" stroke={1.5} />
        </span>
      </div>
      <span className="numero absolute top-3 left-3 rounded-lg bg-black/55 px-3 py-1 text-xs text-white backdrop-blur">{rotuloAntes}</span>
      <span className="numero absolute top-3 right-3 rounded-lg bg-black/55 px-3 py-1 text-xs text-white backdrop-blur">{rotuloDepois}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Posição da cortina entre antes e depois"
        className="sr-only"
      />
    </div>
  )
}
