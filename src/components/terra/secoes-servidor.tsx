import { IconArrowUpRight } from "@tabler/icons-react"
import Link from "next/link"
import { CATEGORIAS, contarPorCategoria } from "@/domain/eventos"
import { buscarEventos, buscarFotosEpic } from "@/server/nasa"
import { numero } from "@/lib/formato"
import { Cabecalho } from "@/components/site/navegacao"
import { GiroDaTerra } from "./giro-da-terra"
import { DesfechoDoHero, TituloDoHero } from "./hero-conteudo"
import { HeroOrbital } from "./hero-orbital"
import { COR_DA_CATEGORIA, IconeEvento } from "./icone-evento"

// Partes da página que vêm do servidor com cache. Se a NASA não responder, mostram um
// estado digno em vez de derrubar a página.

export async function TerraDeHoje() {
  let fotos: Awaited<ReturnType<typeof buscarFotosEpic>> = []
  try {
    fotos = await buscarFotosEpic()
  } catch {
    // estado vazio abaixo
  }
  if (!fotos.length) {
    return (
      <div className="grid aspect-square place-items-center rounded-full border border-white/10 text-center text-sm text-white/60">
        <p className="max-w-56">A câmera EPIC não respondeu agora. Tente de novo em alguns minutos.</p>
      </div>
    )
  }
  return <GiroDaTerra fotos={fotos} />
}

// hero de reserva, parado: enquanto as fotos chegam ou se a EPIC não responder
export function HeroEstatico() {
  return (
    <section className="estrelas relative overflow-hidden text-white">
      <Cabecalho />
      <div className="mx-auto grid min-h-[80svh] max-w-7xl items-center px-4 pb-20 md:px-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <TituloDoHero />
        </div>
      </div>
    </section>
  )
}

export async function HeroDaTerra() {
  let fotos: Awaited<ReturnType<typeof buscarFotosEpic>> = []
  try {
    fotos = await buscarFotosEpic()
  } catch {
    // reserva abaixo
  }
  if (fotos.length < 2) return <HeroEstatico />
  return <HeroOrbital fotos={fotos} topo={<Cabecalho />} titulo={<TituloDoHero />} desfecho={<DesfechoDoHero fotos={fotos.length} />} />
}

export async function EventosAgora() {
  let eventos: Awaited<ReturnType<typeof buscarEventos>>["eventos"] = []
  try {
    eventos = (await buscarEventos()).eventos
  } catch {
    // estado vazio abaixo
  }
  if (!eventos.length) {
    return <p className="text-muted-foreground">O catálogo de eventos da NASA não respondeu agora.</p>
  }
  const contagem = contarPorCategoria(eventos).slice(0, 5)
  // os mais recentes, mas um de cada categoria por vez: senão os icebergs tomam a lista
  const porData = [...eventos].sort((a, b) => b.data.localeCompare(a.data))
  const filas = contagem.map(([cat]) => porData.filter((x) => x.categoria === cat))
  const recentes: (typeof eventos)[number][] = []
  for (let i = 0; recentes.length < 6 && i < 6; i++) for (const f of filas) if (f[i] && recentes.length < 6) recentes.push(f[i]!)
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <dl className="grid content-start grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-2">
        {contagem.map(([cat, n]) => (
          <div key={cat}>
            <dd className="numero text-4xl">{numero(n)}</dd>
            <dt className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <IconeEvento categoria={cat} className="size-4" />
              {CATEGORIAS[cat].nome}
            </dt>
          </div>
        ))}
      </dl>
      <ul className="cartao divide-y p-2 lg:col-span-7">
        {recentes.map((e) => (
          <li key={e.id}>
            <Link
              href={`/explorar?lat=${e.lat.toFixed(3)}&lng=${e.lng.toFixed(3)}&z=8&aba=eventos&nome=${encodeURIComponent(e.titulo)}`}
              className="group grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-muted"
            >
              <span
                className="grid size-9 place-items-center rounded-lg text-white"
                style={{ backgroundColor: COR_DA_CATEGORIA[e.categoria] }}
              >
                <IconeEvento categoria={e.categoria} className="size-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{e.titulo}</span>
                <span className="block text-xs text-muted-foreground">
                  {CATEGORIAS[e.categoria].singular} · {e.data.slice(0, 10).split("-").reverse().join("/")}
                </span>
              </span>
              <IconArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" stroke={1.5} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
