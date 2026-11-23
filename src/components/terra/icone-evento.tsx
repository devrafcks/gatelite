import {
  IconActivityHeartbeat,
  IconAlertTriangle,
  IconBuildingFactory,
  IconDroplet,
  IconFlame,
  IconHaze,
  IconMountain,
  IconRipple,
  IconSnowflake,
  IconStorm,
  IconSunHigh,
  IconTemperature,
  IconVolcano,
} from "@tabler/icons-react"
import type { CategoriaEvento } from "@/domain/eventos"

const ICONES = {
  wildfires: IconFlame,
  severeStorms: IconStorm,
  volcanoes: IconVolcano,
  seaLakeIce: IconSnowflake,
  floods: IconRipple,
  drought: IconSunHigh,
  dustHaze: IconHaze,
  earthquakes: IconActivityHeartbeat,
  landslides: IconMountain,
  snow: IconSnowflake,
  tempExtremes: IconTemperature,
  waterColor: IconDroplet,
  manmade: IconBuildingFactory,
} as const

export const COR_DA_CATEGORIA: Record<CategoriaEvento, string> = {
  wildfires: "#ff5a1f",
  severeStorms: "#5b6cff",
  volcanoes: "#c2410c",
  seaLakeIce: "#38bdf8",
  floods: "#0ea5e9",
  drought: "#e8a317",
  dustHaze: "#a8a29e",
  earthquakes: "#a855f7",
  landslides: "#78716c",
  snow: "#93c5fd",
  tempExtremes: "#f2416b",
  waterColor: "#14b8a6",
  manmade: "#64748b",
}

export function IconeEvento({ categoria, className }: { categoria: CategoriaEvento; className?: string }) {
  const Icone = ICONES[categoria] ?? IconAlertTriangle
  return <Icone className={className} stroke={1.5} />
}
