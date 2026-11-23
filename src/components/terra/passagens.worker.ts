/// <reference lib="webworker" />
import type { LatLng } from "@/domain/geo"
import { criarSatrec, type ElementoOrbital, passagensSobre } from "@/domain/orbitas"
import { SATELITES } from "@/domain/satelites"

export type PedidoDePassagens = {
  id: number
  elementos: readonly ElementoOrbital[]
  lugar: LatLng
  inicio: number
  fim: number
}

const satrecs = new Map<number, ReturnType<typeof criarSatrec>>()
let chaveElementos = ""

self.onmessage = (e: MessageEvent<PedidoDePassagens>) => {
  const { id, elementos, lugar, inicio, fim } = e.data
  const chave = elementos.map((x) => `${x.NORAD_CAT_ID}:${x.EPOCH}`).join("|")
  if (chave !== chaveElementos) {
    satrecs.clear()
    for (const el of elementos) satrecs.set(el.NORAD_CAT_ID, criarSatrec(el))
    chaveElementos = chave
  }
  const passagens = SATELITES.filter((s) => s.faixaKm > 0 && satrecs.has(s.norad))
    .flatMap((sat) => passagensSobre(satrecs.get(sat.norad)!, sat, lugar, inicio, fim))
    .sort((a, b) => a.t - b.t)
  self.postMessage({ id, passagens })
}
