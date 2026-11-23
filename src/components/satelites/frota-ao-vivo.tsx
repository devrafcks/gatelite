"use client"

import { IconArrowUpRight, IconCurrentLocation, IconMoon, IconSun } from "@tabler/icons-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { IlustracaoSatelite } from "@/components/satelites/ilustracao-satelite"
import { Skeleton } from "@/components/ui/skeleton"
import type { LatLng } from "@/domain/geo"
import { passagensSobre, posicaoEm } from "@/domain/orbitas"
import { FAMILIAS } from "@/domain/satelites"
import { elevacaoDoSol, fusoPelaLongitude, horaLocal } from "@/domain/sol"
import { useFrota } from "@/lib/consultas"
import { coordenada, numero } from "@/lib/formato"
import { cn } from "@/lib/utils"

// o globo (d3 + canvas) só baixa nesta página
const GloboPontilhado = dynamic(() => import("@/components/terra/globo-pontilhado").then((m) => m.GloboPontilhado), {
  ssr: false,
  loading: () => <Skeleton className="aspect-square w-full rounded-full" />,
})

export function FrotaAoVivo() {
  const { frota, isPending, isError, error, data } = useFrota()
  const [destaque, setDestaque] = useState<number>(49260)
  // o relógio começa no navegador: no prerender não há "agora"
  const [agora, setAgora] = useState(0)
  const [lugar, setLugar] = useState<(LatLng & { nome: string }) | null>(null)

  useEffect(() => {
    setAgora(Date.now())
    const id = setInterval(() => setAgora(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const atual = frota.find((f) => f.sat.norad === destaque) ?? frota[0]
  const pos = atual && agora ? posicaoEm(atual.satrec, new Date(agora)) : null
  const ladoDoDia = pos ? elevacaoDoSol(new Date(agora), pos.lat, pos.lng) > 0 : false

  // a próxima vez que o satélite escolhido cobre o seu lugar (recalcula só quando muda)
  const minuto = Math.floor(agora / 60_000)
  const proxima = useMemo(() => {
    if (!atual || !lugar || !minuto || atual.sat.faixaKm === 0) return null
    const t0 = minuto * 60_000
    return passagensSobre(atual.satrec, atual.sat, lugar, t0, t0 + 4 * 86_400_000).find((p) => p.dentroDaFaixa) ?? null
  }, [atual, lugar, minuto])

  const meEncontrar = () =>
    navigator.geolocation?.getCurrentPosition(
      (p) => setLugar({ lat: p.coords.latitude, lng: p.coords.longitude, nome: "você" }),
      () => toast.error("Sem permissão de localização."),
    )

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <GloboPontilhado frota={frota} destaque={destaque} aoEscolher={setDestaque} marcador={lugar} />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Arraste para girar · toque num ponto laranja para ver o satélite · rastro dos últimos 25 min
        </p>
      </div>

      <div className="space-y-6 lg:col-span-5">
        {isError && <p className="text-sm text-destructive">{error.message}</p>}
        {atual && pos && (
          <article className="cartao-vitrine px-6 pt-4 pb-7 sm:px-9">
            <span className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-lg bg-black/30 px-2.5 py-1 text-xs text-white/80 backdrop-blur">
              {ladoDoDia ? <IconSun className="size-3.5 text-ambar" stroke={1.5} /> : <IconMoon className="size-3.5" stroke={1.5} />}
              {ladoDoDia ? "sobre o dia" : "sobre a noite"}
            </span>
            <IlustracaoSatelite familia={atual.sat.familia} className="mx-auto -mb-2 w-full max-w-[22rem]" />

            <h2 className="titulo-display text-[2.6rem] leading-none font-semibold sm:text-5xl">{atual.sat.nome}</h2>
            <p className="mt-3 text-[15px] text-white/60">
              {atual.sat.operador} · {atual.sat.sensor} · agora sobre {coordenada(pos.lat, pos.lng)}
            </p>

            <dl className="mx-auto mt-7 grid max-w-sm grid-cols-3 divide-x divide-white/10">
              {[
                ["altitude", numero(pos.altitudeKm), "km"],
                ["detalhe", atual.sat.resolucaoM ? numero(atual.sat.resolucaoM) : "—", atual.sat.resolucaoM ? "m" : ""],
                ["faixa", atual.sat.faixaKm ? numero(atual.sat.faixaKm) : "—", atual.sat.faixaKm ? "km" : ""],
              ].map(([r, v, u]) => (
                <div key={r} className="px-2">
                  <dd className="numero text-2xl leading-none">
                    {v}
                    <span className="ml-0.5 font-sans text-sm text-white/50">{u}</span>
                  </dd>
                  <dt className="mt-1.5 text-xs text-white/45">{r}</dt>
                </div>
              ))}
            </dl>

            <div className="mx-auto mt-8 max-w-sm">
              {!lugar ? (
                <button
                  type="button"
                  onClick={meEncontrar}
                  className="magnetico flex min-h-14 w-full flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-4 py-3 text-center rounded-2xl bg-[#f4f3f1] text-[15px] text-[#0e0e12] transition-colors hover:bg-white"
                >
                  <IconCurrentLocation className="size-5 text-[#6b6a72]" stroke={1.5} />
                  <span className="text-[#6b6a72]">Quando ele passa</span>
                  <span className="font-semibold">por cima de mim?</span>
                </button>
              ) : atual.sat.faixaKm === 0 ? (
                <p className="rounded-2xl bg-white/[0.06] px-4 py-4 text-sm text-white/70">
                  A ISS não fotografa a Terra. As passagens visíveis estão no explorador.
                </p>
              ) : proxima ? (
                <Link
                  href={`/explorar?lat=${lugar.lat.toFixed(3)}&lng=${lugar.lng.toFixed(3)}&aba=satelites`}
                  className="magnetico flex min-h-14 w-full flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-4 py-3 text-center rounded-2xl bg-[#f4f3f1] text-[15px] text-[#0e0e12] transition-colors hover:bg-white"
                >
                  <span className="text-[#6b6a72]">Próxima vez</span>
                  <span className="font-semibold capitalize">
                    {new Date(proxima.t).toLocaleDateString("pt-BR", { weekday: "long" })}, {horaLocal(proxima.t, fusoPelaLongitude(lugar.lng))}
                  </span>
                  <IconArrowUpRight className="size-4" stroke={2} />
                </Link>
              ) : (
                <p className="rounded-2xl bg-white/[0.06] px-4 py-4 text-sm text-white/70">Ele não cobre o seu lugar nos próximos 4 dias.</p>
              )}
              <p className="mt-4 text-xs text-white/45">
                {lugar && proxima
                  ? proxima.deDia
                    ? "Com luz do Sol: dessa vez sai foto."
                    : "De noite: o sensor passa, mas não vê cor."
                  : "Órbita propagada agora, no seu navegador. Nada sai daqui."}
              </p>
            </div>
          </article>
        )}
        {atual && <p className="px-1 text-sm leading-relaxed text-muted-foreground">{atual.sat.resumo}</p>}

        {isPending && <Skeleton className="h-80 rounded-2xl" />}

        {(Object.keys(FAMILIAS) as (keyof typeof FAMILIAS)[]).map((fam) => {
          const lista = frota.filter((f) => f.sat.familia === fam)
          if (!lista.length) return null
          return (
            <div key={fam}>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">{FAMILIAS[fam]}</h3>
              <div className="flex flex-wrap gap-2">
                {lista.map((f) => (
                  <button
                    key={f.sat.norad}
                    type="button"
                    onClick={() => setDestaque(f.sat.norad)}
                    aria-pressed={destaque === f.sat.norad}
                    className={cn(
                      "h-9 rounded-lg border px-3 text-sm transition-colors",
                      destaque === f.sat.norad ? "border-sol bg-sol/15 text-foreground" : "bg-card hover:bg-muted",
                    )}
                  >
                    {f.sat.nome}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
        <p className="text-xs text-muted-foreground">
          Órbitas: {data?.fonte ?? "carregando"}, propagadas com SGP4 no seu navegador a cada segundo.
        </p>
      </div>
    </div>
  )
}
