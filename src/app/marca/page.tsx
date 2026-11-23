import { IconDownload, IconMap2, IconPhoto, IconSatellite, IconStar, IconTimeline, IconWorld } from "@tabler/icons-react"
import type { Metadata } from "next"
import { Logotipo, Simbolo } from "@/components/brand/logo"
import { Cabecalho } from "@/components/site/navegacao"
import { Rodape } from "@/components/site/rodape"
import { Adesivo, type TipoAdesivo } from "@/components/site/adesivos"

export const metadata: Metadata = {
  alternates: { canonical: "/marca" },
  openGraph: { url: "/marca" },
  title: "Marca",
  description: "Logo, símbolo, cores, tipografia e assets do Gatélite.",
}

const CORES = [
  { nome: "Noite", hex: "#08090D", uso: "fundo" },
  { nome: "Painel", hex: "#111319", uso: "cartões" },
  { nome: "Atmosfera", hex: "#2B5BD7", uso: "halos e mapas" },
  { nome: "Laranja", hex: "#FF5A1F", uso: "o único acento" },
  { nome: "Âmbar", hex: "#FFB547", uso: "feixes e gradientes" },
  { nome: "Papel", hex: "#F4F3F1", uso: "texto" },
]

const ARQUIVOS = [
  { nome: "Logo horizontal", arquivo: "gatelite-logo-white.svg" },
  { nome: "Logo horizontal, tinta", arquivo: "gatelite-logo.svg" },
  { nome: "Símbolo", arquivo: "gatelite-mark-white.svg" },
  { nome: "Logotipo", arquivo: "gatelite-wordmark-white.svg" },
  { nome: "Ícone de app", arquivo: "gatelite-app-icon.svg" },
]

const ADESIVOS: TipoAdesivo[] = ["selo", "satelite", "planeta", "cometa", "lua", "simbolo", "pino"]

export default function PaginaMarca() {
  return (
    <div className="bg-background text-foreground">
      <Cabecalho />
      <main className="mx-auto max-w-7xl space-y-24 px-4 pt-8 pb-12 md:px-6">
        <section>
          <h1 className="titulo-display max-w-3xl text-[clamp(2.6rem,6vw,5rem)] font-light">
            A marca <span className="font-semibold">Gatélite.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Gatélite é gato com satélite: curioso, de olho em tudo, sempre de cima. O símbolo é um gato sentado no alto
            de um planeta listrado, olhando a estrela laranja, enquanto os satélites olham de volta para a Terra.
          </p>
          <div className="faixa estrelas mt-10 grid place-items-center rounded-3xl border px-6 py-24">
            <div className="flex items-center gap-3 sm:gap-6">
              <Simbolo className="size-16 text-foreground sm:size-28" titulo="" />
              <Logotipo className="h-7 text-foreground sm:h-14" />
            </div>
          </div>
        </section>

        <section className="revelar grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="cartao grid place-items-center p-10">
            <Simbolo className="size-28 text-foreground" />
            <p className="mt-6 text-sm text-muted-foreground">Símbolo · 48 × 48</p>
          </div>
          <div className="cartao grid place-items-center p-10">
            <Logotipo className="h-8 w-full max-w-[18rem] text-foreground" />
            <p className="mt-6 text-sm text-muted-foreground">Logotipo · Anybody 150%, o I em laranja</p>
          </div>
          <div className="grid place-items-center rounded-2xl bg-[#f4f3f1] p-8 text-[#0e0e12] sm:col-span-2 lg:col-span-1">
            <div className="flex max-w-full items-center gap-2.5">
              <Simbolo className="size-12 shrink-0" titulo="" />
              <Logotipo className="h-5 min-w-0" />
            </div>
            <p className="mt-8 text-sm text-[#6b6a72]">Versão sobre fundo claro</p>
          </div>
        </section>

        <section className="revelar">
          <h2 className="titulo-display mb-8 text-3xl font-light">Cores</h2>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {CORES.map((c) => (
              <li key={c.hex} className="cartao overflow-hidden">
                <div className="h-28 border-b" style={{ background: c.hex }} />
                <div className="p-4">
                  <p className="font-medium">{c.nome}</p>
                  <p className="numero text-sm text-muted-foreground">{c.hex}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.uso}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="revelar grid gap-6 lg:grid-cols-3">
          <div className="cartao p-8 lg:col-span-2">
            <p className="text-sm text-muted-foreground">Display · Anybody</p>
            <p className="titulo-display mt-4 text-6xl font-light">Vista de cima.</p>
            <p className="titulo-display mt-2 text-6xl font-semibold">Vista de cima.</p>
            <p className="mt-8 text-sm text-muted-foreground">Interface · Geist</p>
            <p className="mt-2 text-lg">Escolha um lugar e veja a imagem de satélite de hoje.</p>
            <p className="mt-6 text-sm text-muted-foreground">Medidas · Geist Mono</p>
            <p className="numero mt-2 text-2xl">705 km · 30 m · 185 km</p>
          </div>
          <div className="cartao p-8">
            <p className="text-sm text-muted-foreground">Ícones · Tabler, traço 1,5</p>
            <div className="mt-6 grid grid-cols-3 gap-6 text-foreground">
              {[IconMap2, IconWorld, IconSatellite, IconPhoto, IconTimeline, IconStar].map((I, i) => (
                <I key={i} className="size-8" stroke={1.5} />
              ))}
            </div>
          </div>
        </section>

        <section className="revelar">
          <h2 className="titulo-display mb-8 text-3xl font-light">Adesivos</h2>
          <div className="faixa grid grid-cols-3 gap-6 rounded-3xl border p-8 sm:grid-cols-4 lg:grid-cols-7">
            {ADESIVOS.map((t) => (
              <div key={t} className="mx-auto w-24 drop-shadow-[0_6px_10px_rgb(0_0_0/0.4)]">
                <Adesivo tipo={t} />
              </div>
            ))}
          </div>
        </section>

        <section className="revelar">
          <h2 className="titulo-display mb-8 text-3xl font-light">Baixar</h2>
          <ul className="divide-y rounded-2xl border bg-card">
            {ARQUIVOS.map((a) => (
              <li key={a.arquivo} className="flex items-center justify-between gap-4 px-5 py-4">
                <span>
                  {a.nome} <span className="numero ml-2 text-xs text-muted-foreground">{a.arquivo}</span>
                </span>
                <a
                  href={`/brand/${a.arquivo}`}
                  download
                  className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm hover:bg-muted"
                >
                  <IconDownload className="size-4" stroke={1.5} /> SVG
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Rodape />
    </div>
  )
}
