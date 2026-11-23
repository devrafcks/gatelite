"use client"

import { useEffect, useState } from "react"

export function useImagemSemPreto(url: string | null, limiar = 10) {
  const [limpa, setLimpa] = useState<string | null>(null)

  useEffect(() => {
    if (!url) return
    let cancelado = false
    let objeto: string | null = null
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.decoding = "async"
    img.src = url
    img
      .decode()
      .then(() => {
        if (cancelado) return
        const c = document.createElement("canvas")
        c.width = img.naturalWidth
        c.height = img.naturalHeight
        const g = c.getContext("2d", { willReadFrequently: true })
        if (!g) return setLimpa(url)
        g.drawImage(img, 0, 0)
        const dados = g.getImageData(0, 0, c.width, c.height)
        const p = dados.data
        for (let i = 0; i < p.length; i += 4) {
          if ((p[i] as number) + (p[i + 1] as number) + (p[i + 2] as number) <= limiar) p[i + 3] = 0
        }
        g.putImageData(dados, 0, 0)
        c.toBlob((b) => {
          if (cancelado || !b) return
          objeto = URL.createObjectURL(b)
          setLimpa(objeto)
        }, "image/png")
      })
      .catch(() => !cancelado && setLimpa(url))
    return () => {
      cancelado = true
      if (objeto) URL.revokeObjectURL(objeto)
    }
  }, [url, limiar])

  return limpa
}
