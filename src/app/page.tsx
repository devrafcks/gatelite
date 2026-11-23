import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react"
import Link from "next/link"
import { Suspense } from "react"
import { BuscaRapida } from "@/components/site/busca-rapida"
import { AvisoFontes, Rodape } from "@/components/site/rodape"
import { Cortina } from "@/components/terra/cortina"
import { GloboTardio, QuemPassouTardio } from "@/components/terra/tardios"
import { EventosAgora, HeroDaTerra, HeroEstatico } from "@/components/terra/secoes-servidor"
import { Button } from "@/components/ui/button"
import { urlDaImagem } from "@/domain/gibs"
import { FAMILIAS, SATELITES } from "@/domain/satelites"
import { numero } from "@/lib/formato"

const CAIXA_NOVO_PROGRESSO = { sul: -7.6, norte: -6.4, oeste: -56.2, leste: -54.4 }
const ANTES = urlDaImagem("MODIS_Terra_CorrectedReflectance_TrueColor", "2002-07-10", CAIXA_NOVO_PROGRESSO, 960, 640)
const DEPOIS = urlDaImagem("MODIS_Terra_CorrectedReflectance_TrueColor", "2024-07-18", CAIXA_NOVO_PROGRESSO, 960, 640)

const familias = (Object.keys(FAMILIAS) as (keyof typeof FAMILIAS)[]).filter((f) => f !== "estacao")

export default function Inicio() {
  return (
    <div className="bg-background text-foreground">
      <Suspense fallback={<HeroEstatico />}>
        <HeroDaTerra />
      </Suspense>

      <main>
        <section className="revelar mx-auto grid max-w-7xl gap-12 px-4 py-24 md:px-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="titulo-display text-[clamp(2rem,4vw,3.3rem)] font-light">
              Hoje, <span className="font-semibold">vários satélites</span> já passaram por cima da sua casa.
            </h2>
            <p className="mt-6 max-w-md text-muted-foreground">
              Cada satélite de observação varre uma faixa do chão enquanto voa de polo a polo. O Gatélite calcula as órbitas
              do dia e diz quem cobriu o seu lugar, a que horas, se havia luz do Sol para a foto e onde ver a imagem.
            </p>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Órbitas da CelesTrak, propagadas no seu navegador com o modelo SGP4, o mesmo usado para rastrear satélites
              desde os anos 1980.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <QuemPassouTardio />
          </div>
        </section>

        <section className="estrelas faixa text-white">
          <div className="mx-auto max-w-7xl px-4 py-24 md:px-6">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-6">
              <h2 className="titulo-display text-[clamp(2.2rem,4.6vw,4rem)] font-light">
                {SATELITES.length - 1} olhos em órbita, <span className="font-semibold">do Landsat ao Amazonia-1.</span>
              </h2>
              <p className="mt-6 max-w-lg text-white/65">
                Os de faixa larga cobrem o planeta todo dia, com pouco detalhe. Os de alta resolução enxergam cada
                lavoura, mas voltam ao mesmo lugar a cada poucos dias. Os brasileiros, do INPE, vigiam a Amazônia.
              </p>
              </div>
              <div className="mx-auto w-full max-w-[30rem] lg:col-span-5 lg:col-start-8">
                <GloboTardio />
                <p className="mt-2 text-center text-xs text-white/45">Posição de agora · arraste para girar</p>
              </div>
            </div>
            <div className="mt-14 grid gap-10 lg:grid-cols-3">
              {familias.map((f) => (
                <div key={f}>
                  <h3 className="mb-3 text-sm font-medium text-white/50">{FAMILIAS[f]}</h3>
                  <ul className="divide-y divide-white/10 border-y border-white/10">
                    {SATELITES.filter((s) => s.familia === f).map((s) => (
                      <li key={s.norad} className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4 py-3">
                        <span>
                          {s.nome} <span className="text-xs text-white/45">{s.operador}</span>
                        </span>
                        <span className="numero text-sm text-white/70">{numero(s.resolucaoM)} m</span>
                        <span className="numero w-20 text-right text-sm text-white/45">{numero(s.faixaKm)} km</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-10 flex items-center justify-between gap-4 text-xs text-white/45">
              <span>Resolução do sensor · largura da faixa no chão</span>
              <Link href="/satelites" className="inline-flex items-center gap-1 text-sm text-white hover:underline hover:underline-offset-4">
                Ver todos ao vivo <IconArrowUpRight className="size-4" stroke={1.5} />
              </Link>
            </div>
          </div>
        </section>

        <section className="revelar mx-auto grid max-w-7xl gap-12 px-4 py-24 md:px-6 lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-7">
            <Cortina antes={ANTES} depois={DEPOIS} rotuloAntes="Jul 2002" rotuloDepois="Jul 2024" />
            <p className="mt-3 text-xs text-muted-foreground">
              Novo Progresso (PA), ao longo da BR-163. MODIS/Terra, cor real, ~130 × 200 km.
            </p>
          </div>
          <div className="order-1 flex flex-col justify-center lg:order-2 lg:col-span-4 lg:col-start-9">
            <h2 className="titulo-display text-[clamp(2rem,4vw,3.3rem)] font-light">
              Vinte e dois anos <span className="font-semibold">numa cortina.</span>
            </h2>
            <p className="mt-6 text-muted-foreground">
              Os satélites da NASA fotografam o mesmo lugar todos os dias desde 2000. Arraste para ver a floresta virar
              pasto. No mapa, faça isso com qualquer lugar e qualquer ano, ou toque o time-lapse inteiro.
            </p>
            <Button render={<Link href="/explorar?aba=tempo&lat=-7.0&lng=-55.3&z=8" />} nativeButton={false} variant="outline" size="lg" className="mt-8 self-start">
              Abrir a linha do tempo <IconArrowRight className="size-4" stroke={1.5} />
            </Button>
          </div>
        </section>

        <section className="revelar mx-auto max-w-7xl px-4 pb-24 md:px-6">
          <div className="mb-10 grid gap-6 lg:grid-cols-12">
            <h2 className="titulo-display text-[clamp(2rem,4vw,3.3rem)] font-light lg:col-span-6">
              Enquanto você lê, <span className="font-semibold">o planeta está assim.</span>
            </h2>
            <p className="self-end text-muted-foreground lg:col-span-5 lg:col-start-8">
              Queimadas, tempestades, vulcões e icebergs acompanhados pela NASA neste momento. Toque num evento para ver o
              lugar de cima.
            </p>
          </div>
          <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-muted" />}>
            <EventosAgora />
          </Suspense>
        </section>

        <section className="revelar mx-auto max-w-7xl px-4 md:px-6">
          <div className="estrelas faixa relative overflow-hidden rounded-3xl border px-6 py-16 text-white sm:px-14 sm:py-20">
            <div className="gradiente-sol absolute -top-40 -right-24 size-[26rem] rounded-full opacity-35 blur-3xl" aria-hidden />
            <h2 className="titulo-display relative max-w-3xl text-[clamp(2.3rem,5.4vw,4.6rem)] font-light">
              Qual lugar você quer <span className="font-semibold">ver de cima?</span>
            </h2>
            <BuscaRapida escuro className="relative mt-10 max-w-xl" />
            <AvisoFontes className="relative mt-8 max-w-xl text-xs leading-relaxed text-white/50" />
          </div>
        </section>
      </main>

      <Rodape />
    </div>
  )
}
