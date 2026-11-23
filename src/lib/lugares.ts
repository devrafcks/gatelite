"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type LugarSalvo = {
  readonly id: string
  readonly nome: string
  readonly lat: number
  readonly lng: number
  readonly zoom: number
  readonly salvoEm: number
}

type Estado = {
  lugares: LugarSalvo[]
  salvar: (l: Omit<LugarSalvo, "id" | "salvoEm">) => void
  remover: (id: string) => void
  renomear: (id: string, nome: string) => void
}

const idDe = (lat: number, lng: number) => `${lat.toFixed(3)},${lng.toFixed(3)}`

export const useLugaresSalvos = create<Estado>()(
  persist(
    (set) => ({
      lugares: [],
      salvar: (l) =>
        set((e) => {
          const id = idDe(l.lat, l.lng)
          return { lugares: [{ ...l, id, salvoEm: Date.now() }, ...e.lugares.filter((x) => x.id !== id)].slice(0, 60) }
        }),
      remover: (id) => set((e) => ({ lugares: e.lugares.filter((x) => x.id !== id) })),
      renomear: (id, nome) => set((e) => ({ lugares: e.lugares.map((x) => (x.id === id ? { ...x, nome } : x)) })),
    }),
    { name: "gatelite-lugares", version: 1, storage: createJSONStorage(() => localStorage) },
  ),
)

export const estaSalvo = (lugares: readonly LugarSalvo[], lat: number, lng: number) =>
  lugares.some((l) => l.id === idDe(lat, lng))
