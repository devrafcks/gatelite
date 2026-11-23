"use client"

import { useEffect, useRef, useState } from "react"

export function QuandoVisivel({
  children,
  className,
  margem = "600px",
}: {
  children: React.ReactNode
  className?: string
  margem?: string
}) {
  const caixa = useRef<HTMLDivElement>(null)
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const el = caixa.current
    if (!el || visivel) return
    if (!("IntersectionObserver" in window)) {
      setVisivel(true)
      return
    }
    const obs = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisivel(true)
          obs.disconnect()
        }
      },
      { rootMargin: margem },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [visivel, margem])

  return (
    <div ref={caixa} className={className}>
      {visivel ? children : null}
    </div>
  )
}
