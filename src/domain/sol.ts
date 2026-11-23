import { Body, Equator, Horizon, Observer, SearchRiseSet } from "astronomy-engine"

export const elevacaoDoSol = (data: Date, lat: number, lng: number): number => {
  const obs = new Observer(lat, lng, 0)
  const eq = Equator(Body.Sun, data, obs, true, true)
  return Horizon(data, obs, eq.ra, eq.dec, "normal").altitude
}

export const solDoDia = (dataIso: string, lat: number, lng: number) => {
  const obs = new Observer(lat, lng, 0)
  const inicio = new Date(Date.parse(`${dataIso}T00:00:00Z`) - (lng / 15) * 3_600_000)
  const nascer = SearchRiseSet(Body.Sun, obs, +1, inicio, 1)?.date ?? null
  const por = nascer ? (SearchRiseSet(Body.Sun, obs, -1, nascer, 1)?.date ?? null) : null
  return { nascer, por, duracaoMin: nascer && por ? (por.getTime() - nascer.getTime()) / 60_000 : null }
}
