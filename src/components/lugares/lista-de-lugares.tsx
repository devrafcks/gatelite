"use client"

import { IconArrowUpRight, IconMapPinPlus, IconTrash } from "@tabler/icons-react"
import Link from "next/link"
import { useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { caixaAoRedor } from "@/domain/geo"
import { dataPadrao, urlDaImagem } from "@/domain/gibs"
import { coordenada } from "@/lib/formato"
import { useLugaresSalvos } from "@/lib/lugares"

// Os lugares salvos no aparelho, cada um com a imagem de ontem como miniatura.
export function ListaDeLugares() {
  const lugares = useLugaresSalvos((s) => s.lugares)
  const remover = useLugaresSalvos((s) => s.remover)
  // a lista vem do localStorage: só existe no navegador
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  if (!montado) return <div className="h-64 animate-pulse rounded-2xl bg-muted" />
  // o relógio só é lido no navegador, depois de montar (nunca no prerender)
  const ontem = dataPadrao(new Date().toISOString().slice(0, 10))

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

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lugares.map((l) => (
        <li key={l.id} className="cartao group overflow-hidden">
          <Link href={`/explorar?lat=${l.lat}&lng=${l.lng}&z=${l.zoom}&nome=${encodeURIComponent(l.nome)}`} className="block">
            {/* biome-ignore lint/performance/noImgElement: imagem externa do GIBS */}
            <img
              src={urlDaImagem("MODIS_Terra_CorrectedReflectance_TrueColor", ontem, caixaAoRedor(l, 60), 480, 320)}
              alt={`Imagem de satélite de ${l.nome}`}
              loading="lazy"
              decoding="async"
              className="aspect-[3/2] w-full bg-noite object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </Link>
          <div className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <h2 className="truncate font-medium">{l.nome}</h2>
              <p className="numero truncate text-xs text-muted-foreground">{coordenada(l.lat, l.lng)}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Link
                href={`/explorar?lat=${l.lat}&lng=${l.lng}&z=${l.zoom}&nome=${encodeURIComponent(l.nome)}`}
                aria-label={`Abrir ${l.nome}`}
                className="grid size-9 place-items-center rounded-lg border hover:bg-muted"
              >
                <IconArrowUpRight className="size-4" stroke={1.5} />
              </Link>
              <button
                type="button"
                onClick={() => remover(l.id)}
                aria-label={`Remover ${l.nome}`}
                className="grid size-9 place-items-center rounded-lg border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <IconTrash className="size-4" stroke={1.5} />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
