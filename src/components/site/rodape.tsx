import { IconInfoCircle } from "@tabler/icons-react"
import { RodapeOrbital } from "./rodape-orbital"

export function AvisoFontes({ className }: { className?: string }) {
  return (
    <p className={className}>
      <IconInfoCircle className="mr-1.5 inline size-4 -translate-y-px" stroke={1.5} />
      Imagens e eventos da NASA (GIBS, EPIC, EONET) e órbitas da CelesTrak, abertos e gratuitos. Projeto independente,
      sem ligação oficial com a NASA.
    </p>
  )
}

export function Rodape() {
  return <RodapeOrbital />
}
