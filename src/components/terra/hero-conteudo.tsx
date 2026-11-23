import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react"
import Link from "next/link"
import { BuscaRapida } from "@/components/site/busca-rapida"
import { Button } from "@/components/ui/button"

export function TituloDoHero() {
  return (
    <>
      <h1 className="titulo-display text-[clamp(2.7rem,6.4vw,5.6rem)] font-light text-balance">
        A Terra de hoje, <span className="font-semibold">vista de cima.</span>
      </h1>
      <p className="mt-6 max-w-[31rem] text-lg leading-relaxed text-white/70 text-pretty">
        Escolha um lugar e veja a imagem de satélite de hoje, quais satélites passaram por cima, como ele mudou desde 2000
        e o que está acontecendo perto dele agora.
      </p>
      <BuscaRapida escuro className="mt-8 max-w-[31rem]" />
      <div className="mt-5 flex flex-wrap gap-3">
        <Button render={<Link href="/explorar" />} nativeButton={false} size="lg" variant="sol">
          Abrir o mapa <IconArrowRight className="size-5" stroke={1.5} />
        </Button>
        <Button
          render={<Link href="/planeta" />}
          nativeButton={false}
          size="lg"
          variant="outline"
          className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          A Terra inteira
        </Button>
      </div>
    </>
  )
}

export function DesfechoDoHero({ fotos }: { fotos: number }) {
  return (
    <div className="max-w-2xl">
      <p className="titulo-display text-[clamp(1.6rem,3.6vw,2.8rem)] font-light text-balance">
        Isso foi hoje: <span className="font-semibold">o planeta inteiro em {fotos} fotos.</span>
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm text-white/65">
        Tiradas pela câmera EPIC, parada entre a Terra e o Sol a 1,5 milhão de km. Agora aproxime até a sua rua.
      </p>
      <Button render={<Link href="/explorar" />} nativeButton={false} size="lg" className="mt-6 pr-2">
        Ver o meu lugar
        <span className="grid size-8 place-items-center rounded-lg bg-sol text-white">
          <IconArrowUpRight className="size-4" stroke={2} />
        </span>
      </Button>
    </div>
  )
}
