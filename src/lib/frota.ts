"use client"

import { useMemo } from "react"
import { criarSatrec } from "@/domain/orbitas"
import { SATELITES } from "@/domain/satelites"
import { useElementos } from "./consultas"

export const useFrota = () => {
  const q = useElementos()
  const frota = useMemo(() => {
    if (!q.data) return []
    return SATELITES.flatMap((sat) => {
      const e = q.data.elementos.find((x) => x.NORAD_CAT_ID === sat.norad)
      return e ? [{ sat, elemento: e, satrec: criarSatrec(e) }] : []
    })
  }, [q.data])
  return { ...q, frota }
}
