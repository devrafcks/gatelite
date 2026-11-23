"use client"

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { Slider } from "@/components/ui/slider"
import { CAMADAS, type IdCamada, ID_CAMADAS } from "@/domain/gibs"
import { somarDias } from "@/domain/tempo"
import { dataLonga } from "@/lib/formato"
import { cn } from "@/lib/utils"
import { Aviso, Bloco } from "./pecas"

const GRUPOS = [
  { id: "cor", titulo: "Cor real, todo dia" },
  { id: "detalhe", titulo: "Mais detalhe" },
  { id: "ciencia", titulo: "Ver o invisível" },
] as const

export function AbaImagem({
  data,
  ontem,
  camada,
  opacidade,
  aoMudarData,
  aoMudarCamada,
  aoMudarOpacidade,
}: {
  data: string
  ontem: string
  camada: IdCamada
  opacidade: number
  aoMudarData: (d: string) => void
  aoMudarCamada: (c: IdCamada) => void
  aoMudarOpacidade: (v: number) => void
}) {
  const c = CAMADAS[camada]
  const antesDoInicio = !c.dataFixa && data < c.desde

  return (
    <div className="space-y-6">
      <Bloco titulo="Dia da imagem">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => aoMudarData(somarDias(data, -1))}
            className="grid size-11 shrink-0 place-items-center rounded-xl border bg-card hover:bg-muted"
            aria-label="Dia anterior"
          >
            <IconChevronLeft className="size-5" stroke={1.5} />
          </button>
          <input
            type="date"
            value={data}
            min="2000-02-24"
            max={ontem}
            onChange={(e) => e.target.value && aoMudarData(e.target.value)}
            aria-label="Dia da imagem"
            className="h-11 min-w-0 flex-1 rounded-xl border bg-card px-4 text-center text-[15px] outline-none [color-scheme:dark] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />
          <button
            type="button"
            onClick={() => aoMudarData(somarDias(data, 1))}
            disabled={data >= ontem}
            className="grid size-11 shrink-0 place-items-center rounded-xl border bg-card hover:bg-muted disabled:opacity-40"
            aria-label="Dia seguinte"
          >
            <IconChevronRight className="size-5" stroke={1.5} />
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{c.dataFixa ? "Mosaico fixo, sem data" : dataLonga(data)}</span>
          {data !== ontem && (
            <button type="button" className="font-medium text-foreground hover:underline" onClick={() => aoMudarData(ontem)}>
              Ir para o mais recente
            </button>
          )}
        </div>
        {c.blocos && (
          <Aviso>
            Este mosaico junta as fotos mais nítidas dos últimos meses (às vezes anos). Dá para ver a sua rua, mas não é a imagem de hoje.
          </Aviso>
        )}
        {antesDoInicio && (
          <Aviso tom="sol">Esta camada começa em {dataLonga(c.desde)}. Mostrando a primeira imagem disponível.</Aviso>
        )}
      </Bloco>

      {GRUPOS.map((g) => (
        <Bloco key={g.id} titulo={g.titulo}>
          <div className="space-y-2" role="radiogroup" aria-label={g.titulo}>
            {ID_CAMADAS.filter((id) => CAMADAS[id].grupo === g.id).map((id) => {
              const x = CAMADAS[id]
              const ativa = id === camada
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={ativa}
                  onClick={() => aoMudarCamada(id)}
                  className={cn(
                    "w-full rounded-2xl border bg-card px-4 py-3 text-left transition-colors hover:bg-muted",
                    ativa && "border-sol/70 bg-sol/[0.07] hover:bg-sol/10",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{x.nome}</span>
                    <span className={cn("size-2.5 rounded-full", ativa ? "bg-sol" : "bg-border")} />
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{x.descricao}</span>
                </button>
              )
            })}
          </div>
        </Bloco>
      ))}

      <Bloco titulo="Transparência da camada">
        <Slider
          aria-label="Opacidade da camada"
          min={0}
          max={1}
          step={0.05}
          value={[opacidade]}
          onValueChange={(v) => aoMudarOpacidade(Array.isArray(v) ? (v[0] as number) : (v as number))}
        />
        <p className="text-xs text-muted-foreground">Fonte: {c.fonte}{c.blocos ? "." : ", via NASA GIBS."}</p>
      </Bloco>
    </div>
  )
}
