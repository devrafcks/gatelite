import { Body, Equator, Horizon, Observer, SearchRiseSet } from "astronomy-engine"

export const elevacaoDoSol = (data: Date, lat: number, lng: number): number => {
  const obs = new Observer(lat, lng, 0)
  const eq = Equator(Body.Sun, data, obs, true, true)
  return Horizon(data, obs, eq.ra, eq.dec, "normal").altitude
}

export const fusoPelaLongitude = (lng: number) => Math.round(lng / 15) * 60

export const horaLocal = (instante: Date | number, fusoMin: number): string => {
  const d = new Date(new Date(instante).getTime() + fusoMin * 60_000)
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`
}

export const dataIsoLocal = (instante: Date | number, fusoMin: number): string =>
  new Date(new Date(instante).getTime() + fusoMin * 60_000).toISOString().slice(0, 10)

export const somarDias = (iso: string, dias: number): string => {
  const [a, m, d] = iso.split("-").map(Number) as [number, number, number]
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10)
}

export const solDoDia = (dataIso: string, lat: number, lng: number) => {
  const obs = new Observer(lat, lng, 0)
  const inicio = new Date(Date.parse(`${dataIso}T00:00:00Z`) - (lng / 15) * 3_600_000)
  const nascer = SearchRiseSet(Body.Sun, obs, +1, inicio, 1)?.date ?? null
  const por = nascer ? (SearchRiseSet(Body.Sun, obs, -1, nascer, 1)?.date ?? null) : null
  return { nascer, por, duracaoMin: nascer && por ? (por.getTime() - nascer.getTime()) / 60_000 : null }
}
