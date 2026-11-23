import type { Metadata } from "next"
import { Suspense } from "react"
import { CarregadorDoExplorador, TelaDeCarregamento } from "@/components/explorar/carregador"

export const metadata: Metadata = {
  alternates: { canonical: "/explorar" },
  openGraph: { url: "/explorar" },
  title: "Explorar",
  description:
    "A imagem de satélite de hoje para qualquer lugar, os satélites que passaram por cima, a linha do tempo desde 2000 e os eventos naturais por perto.",
}

export default function PaginaExplorar() {
  return (
    <Suspense fallback={<TelaDeCarregamento />}>
      <CarregadorDoExplorador />
    </Suspense>
  )
}
