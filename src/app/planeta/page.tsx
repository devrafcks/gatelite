import type { Metadata } from "next"
import { Suspense } from "react"
import { FotoDoDia } from "@/components/planeta/foto-do-dia"
import { MapaDoAgora } from "@/components/planeta/mapa-do-agora"
import { VisorEpic } from "@/components/planeta/visor-epic"
import { Cabecalho } from "@/components/site/navegacao"
import { Rodape } from "@/components/site/rodape"
import { Cortina } from "@/components/terra/cortina"
import { EventosAgora } from "@/components/terra/secoes-servidor"
import { urlDaImagem } from "@/domain/gibs"

export const metadata: Metadata = {
  alternates: { canonical: "/planeta" },
  openGraph: { url: "/planeta" },
  title: "A Terra hoje",
  description:
    "O planeta agora: o lado do dia e o da noite com as luzes das cidades, os satélites e os eventos ativos. Mais as fotos da EPIC, as estações numa cortina e a foto do dia.",
}

// as estações: o mesmo planeta no solstício de junho e no de dezembro
// VIIRS no lugar do MODIS: sem os vãos pretos entre as órbitas. Recorte longe dos polos,
// onde a noite polar não tem imagem.
const MUNDO = { sul: -58, norte: 72, oeste: -180, leste: 180 }
const JUNHO = urlDaImagem("VIIRS_NOAA20_CorrectedReflectance_TrueColor", "2025-06-21", MUNDO, 1440, 520)
const DEZEMBRO = urlDaImagem("VIIRS_NOAA20_CorrectedReflectance_TrueColor", "2025-12-21", MUNDO, 1440, 520)

export default function PaginaPlaneta() {
  return (
    <div className="bg-background text-foreground">
      <div className="estrelas">
        <Cabecalho />
        <section className="mx-auto max-w-7xl px-4 pt-6 pb-16 md:px-6">
          <div className="mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
            <h1 className="titulo-display text-[clamp(2.6rem,6vw,5rem)] font-light text-balance lg:col-span-7">
              O planeta, <span className="font-semibold">agora.</span>
            </h1>
            <p className="max-w-md text-muted-foreground lg:col-span-5">
              De dia, o mosaico de ontem dos satélites da NASA. Onde já é noite, as luzes das cidades. A linha entre os dois
              anda enquanto você olha: dá uma volta inteira a cada 24 horas.
            </p>
          </div>
          <MapaDoAgora />
        </section>
      </div>

      <main className="mx-auto max-w-7xl space-y-28 px-4 py-20 md:px-6">
        <section className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="titulo-display text-[clamp(2rem,4vw,3.4rem)] font-light">
              De 1,5 milhão de km, <span className="font-semibold">a Terra inteira.</span>
            </h2>
            <p className="mt-5 max-w-md text-muted-foreground">
              A câmera EPIC fica no ponto onde a gravidade da Terra e a do Sol se equilibram. Dali vê sempre o lado iluminado
              e tira uma foto a cada uma ou duas horas. Arraste o globo para girar o dia; os botões trocam a data.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <VisorEpic />
          </div>
        </section>

        <section>
          <div className="mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2 className="titulo-display text-[clamp(2rem,4vw,3.4rem)] font-light lg:col-span-6">
              As estações <span className="font-semibold">numa cortina.</span>
            </h2>
            <p className="max-w-md text-muted-foreground lg:col-span-5 lg:col-start-8">
              O mesmo planeta em 21 de junho e em 21 de dezembro de 2025. Repare na neve do norte, no gelo do sul, no verde
              que sobe e desce com o Sol.
            </p>
          </div>
          <Cortina antes={JUNHO} depois={DEZEMBRO} rotuloAntes="21 jun 2025" rotuloDepois="21 dez 2025" proporcao="36 / 13" />
          <p className="mt-3 text-xs text-muted-foreground">VIIRS/NOAA-20, cor real, de 58° S a 72° N.</p>
        </section>

        <section className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="titulo-display text-[clamp(2rem,4vw,3.2rem)] font-light">
              E mais longe, <span className="font-semibold">a foto do dia.</span>
            </h2>
            <p className="mt-5 text-muted-foreground">
              Desde 1995 a NASA publica uma imagem do universo por dia, escolhida e explicada por astrônomos.
            </p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <FotoDoDia />
          </div>
        </section>

        <section>
          <h2 className="titulo-display mb-10 max-w-2xl text-[clamp(2rem,4vw,3.2rem)] font-light">
            O que está acontecendo <span className="font-semibold">agora.</span>
          </h2>
          <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-muted" />}>
            <EventosAgora />
          </Suspense>
        </section>
      </main>
      <Rodape />
    </div>
  )
}
