"use client"

import { IconEye, IconMoon, IconPhoto, IconSatellite, IconSun } from "@tabler/icons-react"
import { useMemo, useState } from "react"
import { Switch } from "@/components/ui/switch"
import type { LatLng } from "@/domain/geo"
import { passagensVisiveis } from "@/domain/orbitas"
import { fusoPelaLongitude, horaLocal } from "@/domain/tempo"
import { numero } from "@/lib/formato"
import { cn } from "@/lib/utils"
import type { PassagemComSatelite } from "@/components/terra/use-passagens"
import type { useFrota } from "@/lib/frota"
import { Aviso, Bloco, Segmentos } from "./pecas"

type Janela = "passadas" | "proximas"

export function AbaSatelites({
  lugar,
  agora,
  passagens,
  carregando,
  erro,
  fonte,
  frota,
  selecionada,
  aoSelecionar,
  aoVerImagem,
}: {
  lugar: LatLng
  agora: number
  passagens: readonly PassagemComSatelite[]
  carregando: boolean
  erro: Error | null
  fonte?: string
  frota: ReturnType<typeof useFrota>["frota"]
  selecionada: string | null
  aoSelecionar: (id: string | null) => void
  aoVerImagem: (p: PassagemComSatelite) => void
}) {
  const [janela, setJanela] = useState<Janela>("passadas")
  const [soDentro, setSoDentro] = useState(true)
  const fuso = fusoPelaLongitude(lugar.lng)

  const lista = passagens
    .filter((p) => (janela === "passadas" ? p.t <= agora : p.t > agora))
    .filter((p) => !soDentro || p.dentroDaFaixa)
  const ordenada = janela === "passadas" ? [...lista].reverse() : lista
  const cobertas = passagens.filter((p) => p.t <= agora && p.dentroDaFaixa)

  const iss = frota.find((f) => f.sat.norad === 25544)
  const passesIss = useMemo(
    () => (iss ? passagensVisiveis(iss.satrec, lugar, agora, agora + 3 * 86_400_000).slice(0, 4) : []),
    [iss, lugar, agora],
  )

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-2">
        <div className="border-t border-white/10 pt-3">
          <dt className="text-xs text-muted-foreground">Cobriram nas últimas 24 h</dt>
          <dd className="numero mt-1 text-3xl text-sol">{carregando ? "–" : cobertas.length}</dd>
        </div>
        <div className="border-t border-white/10 pt-3">
          <dt className="text-xs text-muted-foreground">Com luz do Sol</dt>
          <dd className="numero mt-1 text-3xl">{carregando ? "–" : cobertas.filter((p) => p.deDia).length}</dd>
        </div>
      </dl>

      <Bloco titulo="Passagens sobre o lugar">
        <Segmentos
          rotulo="Janela de tempo"
          valor={janela}
          aoMudar={setJanela}
          opcoes={[
            { id: "passadas", rotulo: "Últimas 24 h" },
            { id: "proximas", rotulo: "Próximas 24 h" },
          ]}
        />
        <div className="flex items-center justify-between gap-3 text-sm">
          <span id="so-dentro" className="text-muted-foreground">
            Só quando o lugar caiu dentro da faixa
          </span>
          <Switch aria-labelledby="so-dentro" checked={soDentro} onCheckedChange={(v) => setSoDentro(Boolean(v))} />
        </div>
        {erro && <Aviso tom="erro">{erro.message}</Aviso>}
        {carregando && <Aviso>Calculando as órbitas…</Aviso>}
        {!carregando && ordenada.length === 0 && (
          <Aviso>Nenhuma passagem nessa janela{soDentro ? " com o lugar dentro da faixa" : ""}.</Aviso>
        )}
        <ul className="divide-y cartao overflow-hidden divide-white/[0.06]">
          {ordenada.map((p) => {
            const ativa = selecionada === p.id
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => aoSelecionar(ativa ? null : p.id)}
                  aria-pressed={ativa}
                  className={cn(
                    "grid w-full grid-cols-[2.25rem_1fr_auto] items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-muted",
                    ativa && "bg-sol/[0.08]",
                  )}
                >
                  <span className={cn("grid size-9 place-items-center rounded-lg", ativa ? "bg-sol text-white" : "bg-muted text-muted-foreground")}>
                    <IconSatellite className="size-[18px]" stroke={1.5} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {p.sat.nome} <span className="font-normal text-muted-foreground">· {p.sat.sensor}</span>
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {p.dentroDaFaixa ? "Dentro da faixa" : `A ${numero(p.afastamentoKm)} km`} · rastro a {p.lado} ·{" "}
                      {p.sentido === "norte" ? "subindo" : "descendo"}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="flex items-center gap-1.5">
                      {p.deDia ? <IconSun className="size-3.5 text-sol" stroke={1.5} aria-label="de dia" /> : <IconMoon className="size-3.5 text-muted-foreground" stroke={1.5} aria-label="de noite" />}
                      <span className="numero text-sm">{horaLocal(p.t, fuso)}</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">{relativo(p.t, agora)}</span>
                  </span>
                </button>
                {ativa && (
                  <div className="space-y-2 border-t bg-muted/40 px-4 py-3 text-sm">
                    <p className="text-muted-foreground">{p.sat.resumo}</p>
                    <p className="numero text-xs text-muted-foreground">
                      {numero(p.sat.resolucaoM)} m de resolução · faixa de {numero(p.sat.faixaKm)} km · {numero(p.elevacao)}° acima do
                      horizonte
                    </p>
                    {p.sat.camada && p.deDia && p.dentroDaFaixa && p.t <= agora ? (
                      <button
                        type="button"
                        onClick={() => aoVerImagem(p)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                      >
                        <IconPhoto className="size-4" stroke={1.5} /> Ver a imagem desse dia
                      </button>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {!p.deDia
                          ? "De noite: sensor óptico não registra cor."
                          : p.t > agora
                            ? "Ainda vai passar. A imagem sai algumas horas depois."
                            : !p.dentroDaFaixa
                              ? "O lugar ficou fora da faixa nessa passagem."
                              : "As imagens deste satélite não estão no GIBS."}
                      </p>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
        <p className="text-xs text-muted-foreground">
          Órbitas: {fonte ?? "carregando"} · hora solar local · faixa = largura que o sensor enxerga no chão.
        </p>
      </Bloco>

      <Bloco titulo="Ver a ISS passando">
        {passesIss.length === 0 ? (
          <Aviso>Sem passagens altas da ISS nos próximos 3 dias.</Aviso>
        ) : (
          <ul className="cartao divide-y divide-white/[0.06]">
            {passesIss.map((p) => (
              <li key={p.inicio} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="flex items-center gap-2">
                  <IconEye className={cn("size-4", p.ceuEscuro ? "text-sol" : "text-muted-foreground")} stroke={1.5} />
                  <span>
                    <span className="numero">
                      {new Date(p.pico).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" })} · {horaLocal(p.inicio, fuso)}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {p.ceuEscuro ? "Céu escuro: dá para ver a olho nu" : "Céu claro: difícil de ver"}
                    </span>
                  </span>
                </span>
                <span className="numero text-muted-foreground">{numero(p.elevacaoMax)}°</span>
              </li>
            ))}
          </ul>
        )}
      </Bloco>
    </div>
  )
}

const relativo = (t: number, agora: number) => {
  const min = Math.round((t - agora) / 60_000)
  const abs = Math.abs(min)
  const texto = abs < 60 ? `${abs} min` : `${Math.round(abs / 60)} h`
  return abs < 1 ? "agora" : min < 0 ? `há ${texto}` : `em ${texto}`
}
