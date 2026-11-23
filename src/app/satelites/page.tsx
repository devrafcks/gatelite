import type { Metadata } from "next"
import { Cabecalho } from "@/components/site/navegacao"
import { Rodape } from "@/components/site/rodape"
import { FrotaAoVivo } from "@/components/satelites/frota-ao-vivo"

export const metadata: Metadata = {
  alternates: { canonical: "/satelites" },
  openGraph: { url: "/satelites" },
  title: "Satélites ao vivo",
  description: "Onde estão agora os satélites que fotografam a Terra: Landsat, Sentinel-2, Terra, Aqua, NOAA-20, CBERS e Amazonia-1.",
}

export default function PaginaSatelites() {
  return (
    <div className="bg-background text-foreground">
      <div className="estrelas">
        <Cabecalho />
        <main className="mx-auto max-w-7xl px-4 pt-8 pb-12 md:px-6">
          <h1 className="titulo-display max-w-3xl text-[clamp(2.6rem,6vw,5rem)] font-light text-balance">
            Quem está olhando <span className="font-semibold">agora.</span>
          </h1>
          <p className="mt-5 mb-12 max-w-xl text-lg text-muted-foreground">
            Os satélites que fotografam a Terra, na posição deste segundo. Os de faixa larga cobrem o planeta todo dia;
            os de alta resolução voltam ao mesmo lugar a cada poucos dias.
          </p>
          <FrotaAoVivo />
        </main>
      </div>
      <Rodape />
    </div>
  )
}
