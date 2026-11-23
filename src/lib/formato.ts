const nf = (min: number, max: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: min, maximumFractionDigits: max })

export const numero = (v: number, casas = 0) => nf(casas, casas).format(v)

export const compacto = (v: number) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(v)

export const reais = (v: number, casas = 2) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(v)

// energia com a unidade que deixa o número legível
export const energia = (kwh: number) => {
  if (kwh >= 1_000_000) return { valor: numero(kwh / 1_000_000, 2), unidade: "GWh" }
  if (kwh >= 1000) return { valor: numero(kwh / 1000, 1), unidade: "MWh" }
  if (kwh >= 10) return { valor: numero(kwh, 0), unidade: "kWh" }
  if (kwh >= 0.01) return { valor: numero(kwh, 2), unidade: "kWh" }
  return { valor: numero(kwh * 1000, 2), unidade: "Wh" }
}

export const potencia = (w: number) => {
  if (w >= 1e6) return { valor: numero(w / 1e6, 1), unidade: "MW" }
  if (w >= 1000) return { valor: numero(w / 1000, 1), unidade: "kW" }
  return { valor: numero(w, w < 10 ? 2 : 0), unidade: "W" }
}

export const graus = (v: number, casas = 0) => `${numero(v, casas)}°`

export const duracao = (min: number) => {
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return h > 0 ? `${h} h ${String(m).padStart(2, "0")}` : `${m} min`
}

export const dataLonga = (iso: string) => {
  const [a, m, d] = iso.split("-").map(Number) as [number, number, number]
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(a, m - 1, d)),
  )
}

export const dataCurta = (iso: string) => {
  const [a, m, d] = iso.split("-").map(Number) as [number, number, number]
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })
    .format(new Date(Date.UTC(a, m - 1, d)))
    .replace(".", "")
}

export const coordenada = (lat: number, lng: number) => {
  const f = (v: number, pos: string, neg: string) => `${numero(Math.abs(v), 3)}° ${v >= 0 ? pos : neg}`
  return `${f(lat, "N", "S")}, ${f(lng, "L", "O")}`
}

export const fusoTexto = (min: number) => {
  const sinal = min >= 0 ? "+" : "−"
  const h = Math.floor(Math.abs(min) / 60)
  const m = Math.abs(min) % 60
  return `UTC${sinal}${h}${m ? `:${String(m).padStart(2, "0")}` : ""}`
}
