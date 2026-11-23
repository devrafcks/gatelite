import type { Metadata } from "next"
import { ListaDeLugares } from "@/components/lugares/lista-de-lugares"
import { Cabecalho } from "@/components/site/navegacao"
import { Rodape } from "@/components/site/rodape"

export const metadata: Metadata = {
  alternates: { canonical: "/lugares" },
  openGraph: { url: "/lugares" }, title: "Lugares salvos", description: "Os lugares que você salvou, com a imagem de satélite mais recente." }

export default function PaginaLugares() {
  return (
    <div className="bg-background text-foreground">
      <Cabecalho />
      <main className="mx-auto max-w-7xl px-4 pt-8 pb-12 md:px-6">
        <h1 className="titulo-display text-[clamp(2.6rem,6vw,4.6rem)] font-light">
          Seus <span className="font-semibold">lugares.</span>
        </h1>
        <p className="mt-4 mb-10 max-w-xl text-muted-foreground">Guardados só neste aparelho. Cada um visto de perto e, passando o mouse, na foto mais recente da NASA.</p>
        <ListaDeLugares />
      </main>
      <Rodape />
    </div>
  )
}
