"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { Logotipo, Simbolo } from "@/components/brand/logo"

// A abertura: só na primeira visita ao site, um amanhecer orbital de ~2 s cobre a página
// enquanto ela termina de carregar. Quem volta não vê de novo: um script no começo do
// <body> lê a marca no aparelho e esconde a abertura antes da primeira pintura.
// Tudo em CSS (transform e opacity): nada de biblioteca de animação no pacote do site.

// o player do gato (com WASM) só baixa quando a abertura vai aparecer de fato
const DotLottieReact = dynamic(() => import("@lottiefiles/dotlottie-react").then((m) => m.DotLottieReact), {
  ssr: false,
  loading: () => null,
})

export const CHAVE_ABERTURA = "gatelite-abertura"
// roda antes de pintar: marca o <html> para o CSS esconder a abertura de quem já viu
export const SCRIPT_ABERTURA = `try{if(localStorage.getItem("${CHAVE_ABERTURA}"))document.documentElement.dataset.abertura="vista"}catch(e){}`

const DURACAO_MS = 2200
const DURACAO_REDUZIDA_MS = 700
const SAIDA_MS = 850
const FRASES = ["Apontando os satélites…", "Revelando a foto de hoje…", "Calculando as órbitas…", "Quase lá…"]

type Fase = "entrando" | "saindo" | "fora"

export function Abertura() {
  const [fase, setFase] = useState<Fase>("entrando")
  const [frase, setFrase] = useState(0)
  const [gato, setGato] = useState(false)
  const [gatoFalhou, setGatoFalhou] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    const jaViu = html.dataset.abertura === "vista"
    // aba aberta em segundo plano também não precisa: quando a pessoa chegar, já está pronta
    if (jaViu || document.visibilityState === "hidden") {
      setFase("fora")
      return
    }
    try {
      localStorage.setItem(CHAVE_ABERTURA, "1")
    } catch {
      // sem armazenamento (aba anônima bloqueada): mostra só desta vez
    }
    setGato(true)
    const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
    const total = reduzido ? DURACAO_REDUZIDA_MS : DURACAO_MS
    html.style.overflow = "hidden"

    const passo = total / FRASES.length
    const frases = setInterval(() => setFrase((f) => Math.min(FRASES.length - 1, f + 1)), passo)
    let cancelado = false
    let saida: ReturnType<typeof setTimeout> | undefined
    const sair = () => {
      if (cancelado) return
      cancelado = true
      setFase("saindo")
      html.style.overflow = ""
      saida = setTimeout(() => setFase("fora"), reduzido ? 300 : SAIDA_MS)
    }
    // só sai quando o tempo mínimo passou E a página terminou de carregar
    const pronto = new Promise<void>((ok) => {
      if (document.readyState === "complete") ok()
      else window.addEventListener("load", () => ok(), { once: true })
    })
    const minimo = new Promise<void>((ok) => setTimeout(ok, total))
    Promise.all([pronto, minimo]).then(sair)
    // trava de segurança: nunca prende ninguém mais que 5 s
    const limite = setTimeout(sair, 5000)
    return () => {
      cancelado = true
      clearInterval(frases)
      clearTimeout(limite)
      clearTimeout(saida)
      html.style.overflow = ""
    }
  }, [])

  if (fase === "fora") return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando o Gatélite"
      data-fase={fase}
      className="abertura fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#08090d] text-white"
    >
      {/* o horizonte da Terra visto da órbita: noite no topo, a linha do Sol embaixo */}
      <div className="abertura__ceu absolute inset-0" aria-hidden />
      <div className="estrelas pointer-events-none absolute inset-0 opacity-60" aria-hidden />

      <div className="abertura__conteudo relative z-10 flex flex-col items-center px-6 text-center">
        <div className="h-[132px] w-[185px] sm:h-[160px] sm:w-[224px]" aria-hidden>
          {gato && !gatoFalhou ? (
            <DotLottieReact
              src="/dados/gato-carregando.json"
              loop
              autoplay
              dotLottieRefCallback={(d) => d?.addEventListener("loadError", () => setGatoFalhou(true))}
            />
          ) : (
            <div className="grid h-full place-items-center">
              <Simbolo className="size-20 text-white" titulo="" />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2.5 text-white">
          <Simbolo className="size-7" titulo="" />
          <Logotipo className="h-[18px]" />
        </div>

        <div className="mt-8 h-1 w-56 overflow-hidden rounded-full bg-white/15 sm:w-64">
          <div className="abertura__barra h-full origin-left rounded-full" />
        </div>

        <p key={frase} className="abertura__frase mt-4 h-5 text-sm text-white/75">
          {FRASES[frase]}
        </p>
      </div>

      <p className="absolute bottom-6 z-10 px-6 text-center text-[11px] text-white/45">
        A Terra de hoje, vista de cima · dados abertos da NASA
      </p>
    </div>
  )
}
