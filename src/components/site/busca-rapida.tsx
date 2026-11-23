"use client"

import { IconArrowRight, IconLoader2, IconMapPin, IconSearch, IconStar } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useEffect, useId, useMemo, useState } from "react"
import { sugerirCidades } from "@/data/cidades"
import { useLugares } from "@/lib/consultas"
import { useLugaresSalvos } from "@/lib/lugares"
import { cn } from "@/lib/utils"

type Opcao = { nome: string; detalhe: string; lat: number; lng: number; origem: "salvo" | "cidade" | "busca" }

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const mesmo = (a: Opcao, b: Opcao) => Math.abs(a.lat - b.lat) < 0.05 && Math.abs(a.lng - b.lng) < 0.05

// Busca de lugares que responde na hora: lugares salvos e cidades conhecidas aparecem no
// primeiro toque, sem rede; os resultados da busca de verdade chegam e se somam embaixo.
// Setas para navegar, Enter para escolher, Esc para fechar.
export function BuscaRapida({
  className,
  aoEscolher,
  escuro = false,
  placeholder = "Busque a sua cidade, fazenda ou endereço",
}: {
  className?: string
  aoEscolher?: (l: { nome: string; lat: number; lng: number }) => void
  escuro?: boolean
  placeholder?: string
}) {
  const router = useRouter()
  const id = useId()
  const [texto, setTexto] = useState("")
  const [atrasado, setAtrasado] = useState("")
  const [aberto, setAberto] = useState(false)
  const [ativo, setAtivo] = useState(0)
  const salvos = useLugaresSalvos((s) => s.lugares)

  useEffect(() => {
    const t = setTimeout(() => setAtrasado(texto), 250)
    return () => clearTimeout(t)
  }, [texto])
  const busca = useLugares(atrasado)

  const opcoes = useMemo<Opcao[]>(() => {
    const q = semAcento(texto.trim())
    if (q.length < 2) return []
    const locais: Opcao[] = [
      ...salvos
        .filter((s) => semAcento(s.nome).includes(q))
        .slice(0, 3)
        .map((s) => ({ nome: s.nome, detalhe: "Lugar salvo", lat: s.lat, lng: s.lng, origem: "salvo" as const })),
      ...sugerirCidades(texto, 3).map((c) => ({ ...c, origem: "cidade" as const })),
    ]
    const remotos = (atrasado.trim().length >= 3 ? (busca.data ?? []) : []).map((l) => ({ ...l, origem: "busca" as const }))
    const todas: Opcao[] = []
    for (const o of [...locais, ...remotos]) if (!todas.some((t) => mesmo(t, o))) todas.push(o)
    return todas.slice(0, 8)
  }, [texto, atrasado, salvos, busca.data])

  useEffect(() => setAtivo(0), [opcoes.length])

  const escolher = (l: Opcao) => {
    setTexto("")
    setAberto(false)
    if (aoEscolher) aoEscolher(l)
    else router.push(`/explorar?lat=${l.lat.toFixed(4)}&lng=${l.lng.toFixed(4)}&z=11&nome=${encodeURIComponent(l.nome)}`)
  }

  const mostrar = aberto && texto.trim().length >= 2
  const carregando = busca.isFetching && atrasado.trim().length >= 3

  return (
    <div className={cn("relative", className)}>
      <IconSearch
        className={cn("pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2", escuro ? "text-white/60" : "text-muted-foreground")}
        stroke={1.5}
      />
      <input
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          setAberto(true)
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setAtivo((a) => Math.min(opcoes.length - 1, a + 1))
          } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setAtivo((a) => Math.max(0, a - 1))
          } else if (e.key === "Enter") {
            const o = opcoes[ativo]
            if (o) escolher(o)
          } else if (e.key === "Escape") setAberto(false)
        }}
        placeholder={placeholder}
        aria-label="Buscar um lugar"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={mostrar && opcoes.length > 0}
        aria-controls={`${id}-lista`}
        aria-activedescendant={mostrar && opcoes[ativo] ? `${id}-${ativo}` : undefined}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "h-12 w-full rounded-xl border pr-11 pl-11 text-[15px] outline-none transition-shadow focus-visible:ring-3",
          escuro
            ? "border-white/15 bg-white/10 text-white placeholder:text-white/50 focus-visible:ring-white/20"
            : "bg-card shadow-suave placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30",
        )}
      />
      {carregando && (
        <IconLoader2 className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
      )}
      {mostrar && (
        <div
          id={`${id}-lista`}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-flutuante"
        >
          {opcoes.map((l, i) => {
            const Icone = l.origem === "salvo" ? IconStar : IconMapPin
            return (
              // biome-ignore lint/a11y/useFocusableInteractive: o foco fica no campo (aria-activedescendant)
              <div key={`${l.origem}-${l.lat},${l.lng}`} id={`${id}-${i}`} role="option" aria-selected={i === ativo}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setAtivo(i)}
                  onClick={() => escolher(l)}
                  className={cn(
                    "group flex w-full items-center gap-3 px-4 py-2.5 text-left",
                    i === ativo ? "bg-muted" : "hover:bg-muted",
                  )}
                >
                  <Icone className={cn("size-4 shrink-0", l.origem === "salvo" ? "text-sol" : "text-muted-foreground")} stroke={1.5} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{l.nome}</span>
                    <span className="block truncate text-xs text-muted-foreground">{l.detalhe}</span>
                  </span>
                  <IconArrowRight
                    className={cn("size-4 shrink-0 text-muted-foreground transition-opacity", i === ativo ? "opacity-100" : "opacity-0")}
                    stroke={1.5}
                  />
                </button>
              </div>
            )
          })}
          {opcoes.length === 0 && !carregando && atrasado.trim().length >= 3 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              {busca.isError ? "A busca não respondeu. Tente de novo em instantes." : "Nada com esse nome."}
            </div>
          )}
          {opcoes.length === 0 && (carregando || atrasado !== texto) && (
            <div className="px-4 py-3 text-sm text-muted-foreground">Procurando…</div>
          )}
        </div>
      )}
    </div>
  )
}
