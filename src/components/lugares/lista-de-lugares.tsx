"use client"

import { IconArrowUpRight, IconMapPinPlus, IconPlus, IconSunrise, IconSunset, IconX, IconZoomIn } from "@tabler/icons-react"
import Link from "next/link"
import { useMemo, useSyncExternalStore } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { caixaAoRedor } from "@/domain/geo"
import { dataCompleta, urlDaImagem, urlDoMosaicoDetalhado } from "@/domain/gibs"
import { solDoDia } from "@/domain/sol"
import { fusoPelaLongitude, horaLocal } from "@/domain/tempo"
import { coordenada } from "@/lib/formato"
import { type LugarSalvo, useLugaresSalvos } from "@/lib/lugares"
import { cn } from "@/lib/utils"

const linkDe = (l: LugarSalvo) => `/explorar?lat=${l.lat}&lng=${l.lng}&z=${l.zoom}&nome=${encodeURIComponent(l.nome)}`

const haQuanto = (t: number, agora: number) => {
  const dias = Math.floor((agora - t) / 86_400_000)
  if (dias < 1) return "salvo hoje"
  if (dias === 1) return "salvo ontem"
  if (dias < 30) return `salvo há ${dias} dias`
  const meses = Math.floor(dias / 30)
  return meses === 1 ? "salvo há 1 mês" : `salvo há ${meses} meses`
}

export function ListaDeLugares() {
  const lugares = useLugaresSalvos((s) => s.lugares)
  const remover = useLugaresSalvos((s) => s.remover)
  const salvar = useLugaresSalvos((s) => s.salvar)
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const agora = useMemo(() => (montado ? new Date() : null), [montado])

  if (!montado || !agora) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    )
  }

  if (!lugares.length) {
    return (
      <div className="cartao flex flex-col items-center px-6 py-20 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-sol/15 text-sol">
          <IconMapPinPlus className="size-7" stroke={1.5} />
        </span>
        <h2 className="titulo-display mt-6 text-2xl font-medium">Nenhum lugar salvo ainda</h2>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          No explorador, toque na estrela ao lado do nome do lugar. Ele aparece aqui, com a imagem de satélite mais recente.
        </p>
        <Button render={<Link href="/explorar" />} nativeButton={false} className="mt-8" size="lg">
          Abrir o explorador
        </Button>
      </div>
    )
  }

  const dia = dataCompleta(agora)
  const tirar = (l: LugarSalvo) => {
    remover(l.id)
    toast(`${l.nome} saiu dos salvos.`, {
      action: { label: "Desfazer", onClick: () => salvar({ nome: l.nome, lat: l.lat, lng: l.lng, zoom: l.zoom }) },
    })
  }

  return (
    <>
      <p className="mb-5 text-sm text-muted-foreground">
        <span className="numero text-foreground">{lugares.length}</span> {lugares.length === 1 ? "lugar" : "lugares"} · imagens de{" "}
        {dia.split("-").reverse().join("/")}
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lugares.map((l, i) => (
          <Cartao key={l.id} lugar={l} dia={dia} agora={agora} indice={i} aoRemover={() => tirar(l)} />
        ))}
        <li className="entrar" style={{ animationDelay: `${Math.min(lugares.length, 8) * 60}ms` }}>
          <Link
            href="/explorar"
            className="group flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 text-muted-foreground transition-colors hover:border-sol/50 hover:bg-sol/[0.04] hover:text-foreground"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-white/5 transition-transform duration-300 group-hover:scale-110 group-hover:bg-sol/15 group-hover:text-sol">
              <IconPlus className="size-5" stroke={1.5} />
            </span>
            <span className="text-sm">Salvar outro lugar</span>
          </Link>
        </li>
      </ul>
    </>
  )
}

function Cartao({
  lugar: l,
  dia,
  agora,
  indice,
  aoRemover,
}: {
  lugar: LugarSalvo
  dia: string
  agora: Date
  indice: number
  aoRemover: () => void
}) {
  const caixa = caixaAoRedor(l, 45)
  const diaria = urlDaImagem("VIIRS_NOAA20_CorrectedReflectance_TrueColor", dia, caixa, 560, 420)
  const perto = urlDoMosaicoDetalhado(caixaAoRedor(l, 0.6), 560, 420)
  const sol = useMemo(() => solDoDia(agora.toISOString().slice(0, 10), l.lat, l.lng), [agora, l.lat, l.lng])
  const fuso = fusoPelaLongitude(l.lng)

  return (
    <li
      className="entrar group/cartao relative aspect-[4/3] overflow-hidden rounded-2xl bg-noite ring-1 ring-white/10 transition-shadow duration-300 hover:ring-white/25 hover:shadow-flutuante"
      style={{ animationDelay: `${Math.min(indice, 8) * 60}ms` }}
    >
      <Link href={linkDe(l)} className="absolute inset-0 outline-none focus-visible:ring-2 focus-visible:ring-sol" aria-label={`Abrir ${l.nome} no explorador`}>
        <img
          src={perto}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/cartao:scale-105"
        />
        <img
          src={diaria}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-0 transition duration-500 ease-out group-hover/cartao:scale-100 group-hover/cartao:opacity-100 group-focus-within/cartao:opacity-100"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgb(5_6_10/0.35)_0%,transparent_30%,transparent_45%,rgb(5_6_10/0.92)_100%)]"
        />
      </Link>

      <span className="numero pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 rounded-lg bg-black/45 px-2.5 py-1 text-[11px] text-white/85 backdrop-blur">
        <span className="flex items-center gap-1 group-hover/cartao:hidden">
          <IconZoomIn className="size-3" stroke={1.75} /> de perto
        </span>
        <span className="hidden group-hover/cartao:inline">
          {dia.slice(8, 10)}/{dia.slice(5, 7)} · foto do dia
        </span>
      </span>

      <button
        type="button"
        onClick={aoRemover}
        aria-label={`Remover ${l.nome}`}
        title="Remover"
        className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-lg bg-black/45 text-white/80 backdrop-blur transition hover:bg-black/70 hover:text-white focus-visible:opacity-100 sm:opacity-0 sm:group-hover/cartao:opacity-100"
      >
        <IconX className="size-4" stroke={1.75} />
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-white">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="titulo-display truncate text-xl font-medium">{l.nome}</h2>
            <p className="numero mt-0.5 truncate text-[11px] text-white/60">{coordenada(l.lat, l.lng)}</p>
          </div>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#0e0e12] transition-transform duration-300 group-hover/cartao:-translate-y-0.5 group-hover/cartao:rotate-12">
            <IconArrowUpRight className="size-4" stroke={1.75} />
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/10 pt-3 text-[11px] text-white/70">
          {sol.nascer && (
            <span className="numero flex items-center gap-1">
              <IconSunrise className="size-3.5 text-ambar" stroke={1.5} />
              {horaLocal(sol.nascer, fuso)}
            </span>
          )}
          {sol.por && (
            <span className="numero flex items-center gap-1">
              <IconSunset className="size-3.5 text-sol" stroke={1.5} />
              {horaLocal(sol.por, fuso)}
            </span>
          )}
          <span className={cn("ml-auto", !sol.nascer && "ml-0")}>{haQuanto(l.salvoEm, agora.getTime())}</span>
        </div>
      </div>
    </li>
  )
}
