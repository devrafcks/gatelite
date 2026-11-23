"use client"

import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { type FotoEpic, urlDaFotoEpic } from "@/domain/epic"
import { numero } from "@/lib/formato"
import { cn } from "@/lib/utils"

// A Terra girando com as fotos reais do dia. Arrastar na horizontal gira o planeta:
// cada foto é uma hora diferente, e o lado iluminado anda de leste para oeste.
export function GiroDaTerra({
  fotos,
  className,
  tamanho = "jpg",
  mostrarControles = true,
}: {
  fotos: readonly FotoEpic[]
  className?: string
  tamanho?: "jpg" | "thumbs"
  mostrarControles?: boolean
}) {
  const [indice, setIndice] = useState(0)
  const [tocando, setTocando] = useState(true)
  const [carregadas, setCarregadas] = useState<Set<number>>(() => new Set())
  const arraste = useRef<{ x: number; i: number } | null>(null)
  const n = fotos.length

  useEffect(() => {
    setIndice(0)
    setCarregadas(new Set())
  }, [fotos])

  // pré-carrega todas; só anima depois que a seguinte estiver pronta
  useEffect(() => {
    fotos.forEach((f, i) => {
      const img = new Image()
      img.onload = () => setCarregadas((s) => new Set(s).add(i))
      img.src = urlDaFotoEpic(f, tamanho)
    })
  }, [fotos, tamanho])

  useEffect(() => {
    if (!tocando || n < 2) return
    const id = setInterval(() => {
      setIndice((i) => {
        const prox = (i + 1) % n
        return carregadas.has(prox) ? prox : i
      })
    }, 900)
    return () => clearInterval(id)
  }, [tocando, n, carregadas])

  const foto = fotos[indice]
  if (!foto) return null
  const horaUtc = foto.data.slice(11, 16)

  return (
    <div className={cn("relative", className)}>
      <div
        className="relative aspect-square w-full touch-pan-y overflow-hidden rounded-full select-none"
        onPointerDown={(e) => {
          arraste.current = { x: e.clientX, i: indice }
          setTocando(false)
          ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!arraste.current) return
          const passos = Math.round((e.clientX - arraste.current.x) / 28)
          setIndice((((arraste.current.i - passos) % n) + n) % n)
        }}
        onPointerUp={() => {
          arraste.current = null
        }}
        role="img"
        aria-label={`A Terra fotografada pela câmera EPIC em ${foto.data.slice(0, 10)}, ${horaUtc} UTC`}
      >
        {fotos.map((f, i) => (
          // biome-ignore lint/performance/noImgElement: imagens externas da NASA, já otimizadas
          <img
            key={f.id}
            src={urlDaFotoEpic(f, tamanho)}
            alt=""
            draggable={false}
            loading={i === 0 ? "eager" : "lazy"}
            className={cn(
              // a foto EPIC tem margem preta: amplia até o disco encostar na borda
              "absolute inset-0 h-full w-full scale-[1.2] object-cover transition-opacity duration-700",
              i === indice ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>
      {mostrarControles && (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTocando((v) => !v)}
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label={tocando ? "Pausar a rotação" : "Girar a Terra"}
          >
            {tocando ? <IconPlayerPauseFilled className="size-4" /> : <IconPlayerPlayFilled className="size-4" />}
          </button>
          <span className="numero text-sm text-white/80">
            {horaUtc} <span className="text-white/45">UTC</span>
          </span>
        </div>
      )}
      {/* escolher o horário: cada botão é uma foto do dia, na hora em que foi tirada */}
      {mostrarControles && (
        <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Horário da foto (UTC)">
          {fotos.map((f, i) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={i === indice}
              disabled={!carregadas.has(i) && i !== indice}
              onClick={() => {
                setTocando(false)
                setIndice(i)
              }}
              className={cn(
                "numero h-8 rounded-lg px-2.5 text-xs transition-colors disabled:cursor-wait disabled:opacity-35",
                i === indice ? "bg-sol text-white" : "bg-white/[0.07] text-white/75 hover:bg-white/15 hover:text-white",
              )}
            >
              {f.data.slice(11, 16)}
            </button>
          ))}
        </div>
      )}
      {mostrarControles && (
        <p className="mt-2 text-xs text-white/50">
          Centro em {numero(Math.abs(foto.centro.lat), 1)}° {foto.centro.lat >= 0 ? "N" : "S"},{" "}
          {numero(Math.abs(foto.centro.lng), 1)}° {foto.centro.lng >= 0 ? "L" : "O"} · {numero(foto.distanciaKm / 1e6, 2)} milhão de km
        </p>
      )}
    </div>
  )
}
