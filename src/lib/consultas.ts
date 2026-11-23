"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { FotoEpic } from "@/domain/epic"
import type { Apod, Elementos, Eventos, Lugar } from "@/server/nasa"

export const pegar = async <T>(url: string, signal?: AbortSignal): Promise<T> => {
  const r = await fetch(url, { signal })
  const corpo = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(corpo?.erro ?? `Falha ${r.status}`)
  return corpo as T
}

export const useElementos = () =>
  useQuery({ queryKey: ["elementos"], queryFn: () => pegar<Elementos>("/api/elementos"), staleTime: 2 * 3_600_000 })

export const useEventos = () =>
  useQuery({ queryKey: ["eventos"], queryFn: () => pegar<Eventos>("/api/eventos"), staleTime: 15 * 60_000 })

export const useEpic = (data?: string) =>
  useQuery({
    queryKey: ["epic", data ?? "ultima"],
    queryFn: () => pegar<FotoEpic[]>(`/api/epic${data ? `?data=${data}` : ""}`),
    staleTime: data ? Number.POSITIVE_INFINITY : 3_600_000,
  })

export const useDatasEpic = () =>
  useQuery({ queryKey: ["epic-datas"], queryFn: () => pegar<string[]>("/api/epic-datas"), staleTime: 3_600_000 })

export const useApod = () =>
  useQuery({ queryKey: ["apod"], queryFn: () => pegar<Apod>("/api/apod"), staleTime: 3_600_000 })

const chaveDaBusca = (q: string) => q.trim().replace(/\s+/g, " ").toLowerCase()

export const useLugares = (q: string) => {
  const chave = chaveDaBusca(q)
  return useQuery({
    queryKey: ["lugares", chave],
    queryFn: ({ signal }) => pegar<Lugar[]>(`/api/lugares?q=${encodeURIComponent(chave)}`, signal),
    enabled: chave.length >= 3,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 30 * 60_000,
    placeholderData: keepPreviousData,
    retry: 0,
  })
}

export type { Apod, Elementos, Eventos, Lugar }

type RespostaReversa = { features?: { properties?: Record<string, string | undefined> }[] }

export const useNomeDoPonto = (ponto: { lat: number; lng: number } | null) => {
  const lat = ponto ? ponto.lat.toFixed(3) : null
  const lng = ponto ? ponto.lng.toFixed(3) : null
  return useQuery({
    queryKey: ["reverso", lat, lng],
    enabled: Boolean(ponto),
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
    queryFn: async ({ signal }) => {
      const r = await pegar<RespostaReversa>(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&lang=default`, signal)
      const p = r.features?.[0]?.properties
      if (!p) return null
      const local = p.district ?? p.locality ?? p.name ?? p.city ?? p.county
      const maior = p.city ?? p.county ?? p.state ?? p.country
      return [local, maior !== local ? maior : undefined].filter(Boolean).join(", ") || null
    },
  })
}
