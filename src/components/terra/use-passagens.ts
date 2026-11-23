"use client"

import { useEffect, useRef, useState } from "react"
import type { LatLng } from "@/domain/geo"
import type { Passagem } from "@/domain/orbitas"
import { type Satelite, satelitePorNorad } from "@/domain/satelites"
import { useFrota } from "@/lib/consultas"

export type PassagemComSatelite = Passagem & { readonly sat: Satelite }

// Passagens de todos os satélites de imagem sobre o lugar, de `antesH` horas atrás até
// `depoisH` horas à frente, calculadas num Web Worker. A ISS fica de fora: não tira foto.
export function usePassagens(lugar: LatLng, agora: number, antesH = 24, depoisH = 24) {
  const { frota, isPending, isError, error, data } = useFrota()
  const [passagens, setPassagens] = useState<PassagemComSatelite[]>([])
  const [calculando, setCalculando] = useState(false)
  const trabalhador = useRef<Worker | null>(null)
  const pedido = useRef(0)

  useEffect(() => {
    const w = new Worker(new URL("./passagens.worker.ts", import.meta.url), { type: "module" })
    trabalhador.current = w
    w.onmessage = (e: MessageEvent<{ id: number; passagens: Passagem[] }>) => {
      // respostas atrasadas de um lugar antigo são descartadas
      if (e.data.id !== pedido.current) return
      setPassagens(
        e.data.passagens.flatMap((p) => {
          const sat = satelitePorNorad(p.norad)
          return sat ? [{ ...p, sat }] : []
        }),
      )
      setCalculando(false)
    }
    return () => {
      w.terminate()
      trabalhador.current = null
    }
  }, [])

  // arredonda o lugar e o relógio: mexer um pixel no mapa não refaz a conta
  const lat = Math.round(lugar.lat * 1000) / 1000
  const lng = Math.round(lugar.lng * 1000) / 1000
  const minuto = Math.floor(agora / 60_000) * 60_000

  useEffect(() => {
    const w = trabalhador.current
    if (!w || !data || !agora) return
    pedido.current += 1
    setCalculando(true)
    w.postMessage({
      id: pedido.current,
      elementos: data.elementos,
      lugar: { lat, lng },
      inicio: minuto - antesH * 3_600_000,
      fim: minuto + depoisH * 3_600_000,
    })
  }, [data, lat, lng, minuto, antesH, depoisH, agora])

  return {
    passagens,
    carregando: isPending || (calculando && passagens.length === 0),
    erro: isError ? error : null,
    fonte: data?.fonte,
    frota,
  }
}
