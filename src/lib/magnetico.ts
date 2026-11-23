"use client"

import { useCallback, useRef } from "react"

const FORCA = 0.3
const MAXIMO = 7

let reduzido: boolean | null = null
const pediuMenosMovimento = () => {
  if (reduzido === null && typeof window !== "undefined") {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    reduzido = mq.matches
    mq.addEventListener?.("change", (e) => {
      reduzido = e.matches
    })
  }
  return Boolean(reduzido)
}

export function useMagnetico(ativo = true) {
  const quadro = useRef(0)

  const mover = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!ativo || e.pointerType !== "mouse" || pediuMenosMovimento()) return
      const el = e.currentTarget
      const { clientX, clientY } = e
      cancelAnimationFrame(quadro.current)
      quadro.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const dx = clientX - (r.left + r.width / 2)
        const dy = clientY - (r.top + r.height / 2)
        const x = Math.max(-MAXIMO, Math.min(MAXIMO, dx * FORCA))
        const y = Math.max(-MAXIMO, Math.min(MAXIMO, dy * FORCA))
        el.style.setProperty("--mag-x", `${x.toFixed(2)}px`)
        el.style.setProperty("--mag-y", `${y.toFixed(2)}px`)
        el.dataset.magnetizado = ""
      })
    },
    [ativo],
  )

  const sair = useCallback((e: React.PointerEvent<HTMLElement>) => {
    cancelAnimationFrame(quadro.current)
    const el = e.currentTarget
    el.style.setProperty("--mag-x", "0px")
    el.style.setProperty("--mag-y", "0px")
    delete el.dataset.magnetizado
  }, [])

  return { mover, sair }
}
