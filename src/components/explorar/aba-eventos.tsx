"use client"

import { IconExternalLink, IconRefresh } from "@tabler/icons-react"
import { useMemo, useState } from "react"
import { COR_DA_CATEGORIA, IconeEvento } from "@/components/terra/icone-evento"
import { Button } from "@/components/ui/button"
import { CATEGORIAS, type CategoriaEvento, contarPorCategoria, type Evento, eventosPerto } from "@/domain/eventos"
import type { LatLng } from "@/domain/geo"
import { numero } from "@/lib/formato"
import { cn } from "@/lib/utils"
import { Aviso, Bloco, Pilula, Segmentos } from "./pecas"

type Alcance = "perto" | "mundo"

export function AbaEventos({
  lugar,
  eventos,
  carregando,
  erro,
  aoRecarregar,
  aoIrPara,
  filtro,
  aoFiltrar,
}: {
  lugar: LatLng
  eventos: readonly Evento[]
  carregando: boolean
  erro: Error | null
  aoRecarregar: () => void
  aoIrPara: (e: Evento) => void
  filtro: CategoriaEvento | null
  aoFiltrar: (c: CategoriaEvento | null) => void
}) {
  const [alcance, setAlcance] = useState<Alcance>("perto")
  const contagem = useMemo(() => contarPorCategoria(eventos), [eventos])
  const lista = useMemo(() => {
    const base = eventosPerto(eventos, lugar, alcance === "perto" ? 2000 : 25_000)
    return (filtro ? base.filter((e) => e.categoria === filtro) : base).slice(0, 60)
  }, [eventos, lugar, alcance, filtro])

  return (
    <div className="space-y-6">
      <Segmentos
        rotulo="Alcance"
        valor={alcance}
        aoMudar={setAlcance}
        opcoes={[
          { id: "perto", rotulo: "Até 2.000 km" },
          { id: "mundo", rotulo: "No mundo" },
        ]}
      />

      <Bloco titulo={`${numero(eventos.length)} eventos ativos na NASA`}>
        <div className="flex flex-wrap gap-2">
          <Pilula ativo={filtro === null} onClick={() => aoFiltrar(null)}>
            Todos
          </Pilula>
          {contagem.map(([cat, n]) => (
            <Pilula key={cat} ativo={filtro === cat} onClick={() => aoFiltrar(filtro === cat ? null : cat)}>
              <IconeEvento categoria={cat} className="size-4" />
              {CATEGORIAS[cat].nome}
              <span className="numero text-xs opacity-70">{n}</span>
            </Pilula>
          ))}
        </div>
      </Bloco>

      {carregando && <Aviso>Buscando os eventos da NASA…</Aviso>}
      {erro && (
        <div className="space-y-2">
          <Aviso tom="erro">{erro.message}</Aviso>
          <Button variant="outline" size="sm" onClick={aoRecarregar}>
            <IconRefresh className="size-4" stroke={1.5} /> Tentar de novo
          </Button>
        </div>
      )}
      {!carregando && !erro && lista.length === 0 && (
        <Aviso>
          Nenhum evento ativo {alcance === "perto" ? "a menos de 2.000 km daqui" : "com esse filtro"}. Boa notícia.
        </Aviso>
      )}

      <ul className="divide-y cartao overflow-hidden divide-white/[0.06]">
        {lista.map((e) => (
          <li key={e.id} className="group grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 px-3.5 py-3">
            <span
              className="grid size-9 place-items-center rounded-lg text-white"
              style={{ backgroundColor: COR_DA_CATEGORIA[e.categoria] }}
            >
              <IconeEvento categoria={e.categoria} className="size-[18px]" />
            </span>
            <button type="button" onClick={() => aoIrPara(e)} className="min-w-0 text-left">
              <span className="block truncate text-sm font-medium group-hover:underline group-hover:underline-offset-4">
                {e.titulo}
              </span>
              <span className="block text-xs text-muted-foreground">
                {CATEGORIAS[e.categoria].singular} · {numero(e.distanciaKm)} km · {e.data.slice(0, 10).split("-").reverse().join("/")}
                {e.magnitude ? ` · ${e.magnitude}` : ""}
              </span>
            </button>
            {e.link ? (
              <a
                href={e.link}
                target="_blank"
                rel="noreferrer"
                className={cn("grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground")}
                aria-label={`Fonte do evento: ${e.fonte ?? "link"}`}
              >
                <IconExternalLink className="size-4" stroke={1.5} />
              </a>
            ) : (
              <span />
            )}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">Fonte: NASA EONET, eventos abertos nos últimos 60 dias.</p>
    </div>
  )
}
