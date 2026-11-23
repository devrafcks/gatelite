import { Body, Illumination, MoonPhase } from "astronomy-engine"

const nomeDaFase = (fase: number): string => {
  const f = ((fase % 360) + 360) % 360
  if (f < 11.25 || f >= 348.75) return "Lua nova"
  if (f < 78.75) return "Crescente"
  if (f < 101.25) return "Quarto crescente"
  if (f < 168.75) return "Crescente gibosa"
  if (f < 191.25) return "Lua cheia"
  if (f < 258.75) return "Minguante gibosa"
  if (f < 281.25) return "Quarto minguante"
  return "Minguante"
}

export const luaDoMomento = (d: Date) => {
  const fase = MoonPhase(d)
  return { fase, nome: nomeDaFase(fase), iluminada: Illumination(Body.Moon, d).phase_fraction }
}
