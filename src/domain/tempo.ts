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
