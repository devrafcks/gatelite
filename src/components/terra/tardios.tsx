"use client"

import dynamic from "next/dynamic"
import { QuandoVisivel } from "@/components/site/quando-visivel"

const QuemPassou = dynamic(() => import("./quem-passou").then((m) => m.QuemPassou), {
  ssr: false,
  loading: () => <div className="cartao-vitrine h-[34rem] animate-pulse" />,
})
const GloboDaLanding = dynamic(() => import("@/components/satelites/globo-da-landing").then((m) => m.GloboDaLanding), {
  ssr: false,
})

export function QuemPassouTardio() {
  return (
    <QuandoVisivel className="min-h-[34rem]">
      <QuemPassou />
    </QuandoVisivel>
  )
}

export function GloboTardio() {
  return (
    <QuandoVisivel className="aspect-square w-full">
      <GloboDaLanding />
    </QuandoVisivel>
  )
}
