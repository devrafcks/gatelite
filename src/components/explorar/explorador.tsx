"use client"

import {
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconCurrentLocation,
  IconLink,
  IconPhoto,
  IconSatellite,
  IconStar,
  IconStarFilled,
  IconTimeline,
  IconAlertTriangle,
} from "@tabler/icons-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { MapaTerra, type Sobreposicoes } from "@/components/mapa/mapa-terra"
import { BuscaRapida } from "@/components/site/busca-rapida"
import { Cabecalho } from "@/components/site/navegacao"
import { usePassagens } from "@/components/terra/use-passagens"
import type { CategoriaEvento } from "@/domain/eventos"
import { poligonoDaFaixa } from "@/domain/geo"
import { CAMADAS, dataCompleta, type IdCamada } from "@/domain/gibs"
import { rastroEntre } from "@/domain/orbitas"
import { dataIsoLocal, somarDias } from "@/domain/sol"
import { useEventos, useNomeDoPonto } from "@/lib/consultas"
import { coordenada } from "@/lib/formato"
import { estaSalvo, useLugaresSalvos } from "@/lib/lugares"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import { AbaImagem } from "./aba-imagem"
import { AbaSatelites } from "./aba-satelites"

// as abas menos usadas só baixam quando alguém abre
const CarregandoAba = () => <div className="h-48 animate-pulse rounded-2xl bg-muted/60" />
const AbaTempo = dynamic(() => import("./aba-tempo").then((m) => m.AbaTempo), { loading: CarregandoAba })
const AbaEventos = dynamic(() => import("./aba-eventos").then((m) => m.AbaEventos), { loading: CarregandoAba })
import { type Aba, useEstadoExplorar } from "./estado"

const ABAS_UI: { id: Aba; rotulo: string; icone: typeof IconPhoto }[] = [
  { id: "imagem", rotulo: "Imagem", icone: IconPhoto },
  { id: "satelites", rotulo: "Satélites", icone: IconSatellite },
  { id: "tempo", rotulo: "Tempo", icone: IconTimeline },
  { id: "eventos", rotulo: "Eventos", icone: IconAlertTriangle },
]

const ATALHOS_DE_CAMADA: { id: IdCamada; rotulo: string }[] = [
  { id: "cor-noaa20", rotulo: "Cor real" },
  { id: "detalhe", rotulo: "Detalhe" },
  { id: "cor-terra", rotulo: "Manhã" },
  { id: "hls", rotulo: "30 m" },
  { id: "infravermelho", rotulo: "Infravermelho" },
  { id: "noite", rotulo: "Noite" },
]

export function Explorador() {
  const [e, setE] = useEstadoExplorar()
  const [agora, setAgora] = useState(() => Date.now())
  // o dia mais recente com o mosaico inteiro: antes disso os blocos ainda vêm escuros
  const ontem = dataCompleta(new Date(agora))
  const data = e.data ?? ontem
  const lugar = useMemo(() => ({ lat: e.lat, lng: e.lng }), [e.lat, e.lng])
  const [visao, setVisao] = useState(() => ({ centro: lugar, zoom: e.z }))
  const [opacidade, setOpacidade] = useState(1)
  const [filtro, setFiltro] = useState<CategoriaEvento | null>(null)
  const [aberto, setAberto] = useState(true)
  const [painelVisivel, setPainelVisivel] = useState(true)
  const lugares = useLugaresSalvos((s) => s.lugares)
  const salvar = useLugaresSalvos((s) => s.salvar)
  const remover = useLugaresSalvos((s) => s.remover)
  const salvo = estaSalvo(lugares, e.lat, e.lng)

  // as passagens andam com o relógio
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 5 * 60_000)
    return () => clearInterval(id)
  }, [])

  const { passagens, carregando, erro, fonte, frota } = usePassagens(lugar, agora, 24, 24)
  const eventos = useEventos()

  const irPara = (lat: number, lng: number, zoom = Math.max(e.z, 8), nome: string | null = null) => {
    setE({ lat, lng, nome, passagem: null })
    setVisao({ centro: { lat, lng }, zoom })
  }

  // ponto tocado no mapa ganha um nome (bairro, cidade) em vez de "ponto escolhido"
  const nomeDoPonto = useNomeDoPonto(e.nome ? null : lugar)
  const titulo = e.nome ?? nomeDoPonto.data ?? "Ponto no mapa"

  // trocar de camada: o mosaico detalhado só faz sentido de perto
  const trocarCamada = (id: IdCamada) => {
    setE({ camada: id })
    if (CAMADAS[id].blocos && e.z < 13) setVisao({ centro: lugar, zoom: 16 })
    else if (!CAMADAS[id].blocos && e.z > 12.5) setVisao({ centro: lugar, zoom: 11 })
  }

  // escolher um dia da tira de 14 dias: volta para uma camada diária se preciso
  const escolherDia = (dia: string) => {
    const c = CAMADAS[e.camada]
    setE({
      data: dia === ontem ? null : dia,
      ...(c.dataFixa || c.id === "hls" ? { camada: "cor-noaa20" as const } : {}),
    })
    if (e.z > 12.5) setVisao({ centro: lugar, zoom: 10 })
  }

  const selecionada = passagens.find((p) => p.id === e.passagem) ?? null
  const sobreposicoes = useMemo<Sobreposicoes>(() => {
    if (e.aba === "satelites" && selecionada) {
      const f = frota.find((x) => x.sat.norad === selecionada.norad)
      if (f) {
        const rastro = rastroEntre(f.satrec, selecionada.t - 9 * 60_000, selecionada.t + 9 * 60_000, 20)
        return {
          rastros: [{ id: selecionada.id, pontos: rastro, ativo: true }],
          faixas: [{ id: selecionada.id, poligono: poligonoDaFaixa(rastro, selecionada.sat.faixaKm), ativo: true }],
        }
      }
    }
    if (e.aba === "eventos" && eventos.data) {
      const lista = filtro ? eventos.data.eventos.filter((x) => x.categoria === filtro) : eventos.data.eventos
      return { eventos: lista }
    }
    return {}
  }, [e.aba, selecionada, frota, eventos.data, filtro])

  // ao escolher uma passagem, a câmera abre para mostrar a faixa inteira
  useEffect(() => {
    if (selecionada) setVisao({ centro: lugar, zoom: selecionada.sat.faixaKm > 1500 ? 3.4 : 5.2 })
    // biome-ignore lint/correctness/useExhaustiveDependencies: só quando muda a passagem
  }, [selecionada?.id])

  const meEncontrar = () => {
    if (!("geolocation" in navigator)) return toast.error("Este navegador não informa a localização.")
    navigator.geolocation.getCurrentPosition(
      (p) => irPara(p.coords.latitude, p.coords.longitude, 11, "Onde eu estou"),
      () => toast.error("Sem permissão de localização. Busque pelo nome ou toque no mapa."),
      { timeout: 10_000 },
    )
  }

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copiado. Quem abrir vê exatamente esta imagem.")
    } catch {
      toast.error("Não deu para copiar. O endereço na barra já é o link.")
    }
  }

  const alternarSalvo = () => {
    if (salvo) {
      remover(`${e.lat.toFixed(3)},${e.lng.toFixed(3)}`)
      toast("Lugar removido dos salvos.")
    } else {
      salvar({ nome: e.nome ?? coordenada(e.lat, e.lng), lat: e.lat, lng: e.lng, zoom: e.z })
      toast.success("Lugar salvo neste aparelho.")
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#05060a]">
      <MapaTerra
        ponto={lugar}
        visao={visao}
        camada={CAMADAS[e.camada]}
        data={data}
        opacidade={opacidade}
        sobreposicoes={sobreposicoes}
        aoClicar={(p) =>
          setE({ lat: Number(p.lat.toFixed(4)), lng: Number(p.lng.toFixed(4)), nome: null, passagem: null })
        }
        aoMover={(_, z) => setE({ z: Number(z.toFixed(2)) })}
        aoClicarEvento={(id) => {
          const ev = eventos.data?.eventos.find((x) => x.id === id)
          if (ev) irPara(ev.lat, ev.lng, 8, ev.titulo)
        }}
      />
      <Cabecalho sobreposto />

      {/* barra de navegação sobre o mapa (desktop): o dia e as camadas mais usadas, sem abrir o painel */}
      <div
        className={cn(
          "absolute bottom-8 z-20 hidden -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/10 bg-[#0b0e15]/85 p-1.5 text-sm text-white shadow-flutuante backdrop-blur-xl transition-[left] duration-300 lg:flex",
          painelVisivel ? "left-[calc(50%+13.5rem)]" : "left-1/2",
        )}
      >
        <button
          type="button"
          onClick={() => setE({ data: somarDias(data, -1) })}
          className="grid size-9 place-items-center rounded-xl hover:bg-white/10"
          aria-label="Dia anterior"
          disabled={Boolean(CAMADAS[e.camada].dataFixa)}
        >
          <IconChevronLeft className="size-4" stroke={1.75} />
        </button>
        <span className="flex min-w-[7.5rem] items-center justify-center gap-1.5 px-1">
          <IconCalendarEvent className="size-4 text-sol" stroke={1.5} />
          <span className="numero">{CAMADAS[e.camada].dataFixa ? "mosaico" : data.split("-").reverse().join("/")}</span>
        </span>
        <button
          type="button"
          onClick={() => setE({ data: somarDias(data, 1) >= ontem ? null : somarDias(data, 1) })}
          className="grid size-9 place-items-center rounded-xl hover:bg-white/10 disabled:opacity-30"
          aria-label="Dia seguinte"
          disabled={data >= ontem || Boolean(CAMADAS[e.camada].dataFixa)}
        >
          <IconChevronRight className="size-4" stroke={1.75} />
        </button>
        <span className="mx-1 h-6 w-px bg-white/10" aria-hidden />
        {ATALHOS_DE_CAMADA.map(({ id, rotulo }) => (
          <button
            key={id}
            type="button"
            onClick={() => trocarCamada(id)}
            aria-pressed={e.camada === id}
            className={cn(
              "h-9 rounded-xl px-3 whitespace-nowrap transition-colors",
              e.camada === id ? "bg-white text-[#0e0e12]" : "text-white/75 hover:bg-white/10 hover:text-white",
            )}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {/* reabrir o painel quando ele está recolhido (desktop) */}
      {!painelVisivel && (
        <button
          type="button"
          onClick={() => setPainelVisivel(true)}
          className="absolute top-20 left-4 z-30 hidden h-11 items-center gap-2 rounded-xl border border-white/10 bg-[#0b0e15]/85 pr-4 pl-3 text-sm text-white shadow-flutuante backdrop-blur-xl hover:bg-[#151a24] lg:flex"
          aria-label="Mostrar o painel"
        >
          <IconLayoutSidebarLeftExpand className="size-[18px]" stroke={1.5} />
          <span className="max-w-48 truncate">{titulo}</span>
        </button>
      )}

      <aside
        aria-label="Painel do explorador"
        className={cn(
          "absolute z-30 flex flex-col overflow-hidden border border-white/[0.07] text-card-foreground shadow-flutuante transition-[height,transform,opacity] duration-300",
          "bg-[linear-gradient(180deg,#151b26_0%,#0d1018_100%)]",
          "inset-x-0 bottom-0 rounded-t-2xl",
          aberto ? "h-[min(76dvh,46rem)]" : "h-[9.5rem]",
          "lg:inset-x-auto lg:top-20 lg:bottom-4 lg:left-4 lg:h-auto lg:w-[26rem] lg:rounded-2xl",
          !painelVisivel && "lg:pointer-events-none lg:-translate-x-[calc(100%+2rem)] lg:opacity-0",
        )}
      >
        <button
          type="button"
          onClick={() => setPainelVisivel(false)}
          className="absolute top-4 right-4 z-10 hidden size-9 place-items-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground lg:grid"
          aria-label="Recolher o painel"
          title="Recolher o painel"
        >
          <IconLayoutSidebarLeftCollapse className="size-[18px]" stroke={1.5} />
        </button>
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="flex w-full flex-col items-center pt-2.5 pb-1 lg:hidden"
          aria-label={aberto ? "Recolher o painel" : "Abrir o painel"}
          aria-expanded={aberto}
        >
          <span className="h-1.5 w-11 rounded-full bg-border" />
          <IconChevronUp
            className={cn("mt-0.5 size-4 text-muted-foreground transition-transform", aberto && "rotate-180")}
          />
        </button>

        <div className="space-y-3 px-4 pb-3 lg:pt-4">
          <div className="lg:pr-12">
            <BuscaRapida
              placeholder="Buscar um lugar"
              aoEscolher={(l) => {
                irPara(l.lat, l.lng, 10, l.nome)
                setAberto(true)
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1
                className="titulo-display line-clamp-2 text-[1.2rem] leading-tight font-medium text-balance"
                title={titulo}
              >
                {titulo}
              </h1>
              <p className="numero truncate text-xs text-muted-foreground">{coordenada(e.lat, e.lng)}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              {[
                { rotulo: "Minha localização", icone: IconCurrentLocation, acao: meEncontrar },
                { rotulo: "Copiar link desta visão", icone: IconLink, acao: copiarLink },
                {
                  rotulo: salvo ? "Remover dos salvos" : "Salvar lugar",
                  icone: salvo ? IconStarFilled : IconStar,
                  acao: alternarSalvo,
                },
              ].map(({ rotulo, icone: Icone, acao }) => (
                <button
                  key={rotulo}
                  type="button"
                  onClick={acao}
                  aria-label={rotulo}
                  title={rotulo}
                  className={cn(
                    "grid size-10 place-items-center rounded-xl border bg-card transition-colors hover:bg-muted",
                    rotulo === "Remover dos salvos" && "text-sol",
                  )}
                >
                  <Icone className="size-[18px]" stroke={1.5} />
                </button>
              ))}
            </div>
          </div>
          {/* abas: controle segmentado com a pílula ativa deslizando por baixo */}
          <nav
            aria-label="Abas"
            className="relative grid grid-cols-4 rounded-xl border border-white/[0.06] bg-black/30 p-1"
          >
            <span
              aria-hidden
              className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/4)] rounded-lg bg-white/[0.09] shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: `translateX(${
                  Math.max(
                    0,
                    ABAS_UI.findIndex((a) => a.id === e.aba),
                  ) * 100
                }%)`,
              }}
            />
            {ABAS_UI.map(({ id, rotulo, icone: Icone }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setE({ aba: id })
                  setAberto(true)
                }}
                aria-current={e.aba === id ? "page" : undefined}
                className={cn(
                  "relative z-10 flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-lg px-1 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-white/30",
                  e.aba === id && "text-foreground",
                )}
              >
                <Icone className={cn("size-4 shrink-0 transition-colors", e.aba === id && "text-sol")} stroke={1.5} />
                <span className="hidden truncate sm:inline">{rotulo}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border-t px-4 pt-5 pb-8">
          {e.aba === "imagem" && (
            <AbaImagem
              data={data}
              ontem={ontem}
              camada={e.camada}
              opacidade={opacidade}
              aoMudarData={(d) => setE({ data: d === ontem ? null : d })}
              aoMudarCamada={trocarCamada}
              aoMudarOpacidade={setOpacidade}
            />
          )}
          {e.aba === "satelites" && (
            <AbaSatelites
              lugar={lugar}
              agora={agora}
              passagens={passagens}
              carregando={carregando}
              erro={erro}
              fonte={fonte}
              frota={frota}
              selecionada={e.passagem}
              aoSelecionar={(id) => setE({ passagem: id })}
              aoVerImagem={(p) => {
                setE({ camada: p.sat.camada ?? "cor-terra", data: dataIsoLocal(p.t, 0), aba: "imagem", passagem: null })
                setVisao({ centro: lugar, zoom: p.sat.camada === "hls" ? 10 : 7.5 })
                toast(`Imagem de ${p.sat.nome} do dia ${dataIsoLocal(p.t, 0).split("-").reverse().join("/")}.`)
              }}
            />
          )}
          {e.aba === "tempo" && (
            <AbaTempo
              lugar={lugar}
              zoom={e.z}
              data={data}
              ultimo={ontem}
              camada={e.camada}
              aoEscolherDia={escolherDia}
            />
          )}
          {e.aba === "eventos" && (
            <AbaEventos
              lugar={lugar}
              eventos={eventos.data?.eventos ?? []}
              carregando={eventos.isPending}
              erro={eventos.isError ? eventos.error : null}
              aoRecarregar={() => eventos.refetch()}
              aoIrPara={(ev) => irPara(ev.lat, ev.lng, 8, ev.titulo)}
              filtro={filtro}
              aoFiltrar={setFiltro}
            />
          )}
        </div>
      </aside>
    </div>
  )
}
