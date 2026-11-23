"use client"

import { AnimatePresence, motion } from "motion/react"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { Logotipo, Simbolo } from "@/components/brand/logo"

// A abertura: toda vez que alguém entra no site, um amanhecer orbital de ~2 s cobre a
// página enquanto ela termina de carregar. O gradiente respira como a atmosfera vista
// de cima, o gato espera, a barra enche, e tudo sobe como uma cortina.
// Navegar entre páginas não repete a abertura: ela vive no layout, que não remonta.

// o player do gato (com WASM) chega depois: a abertura pinta na hora, o gato entra em seguida
const DotLottieReact = dynamic(() => import("@lottiefiles/dotlottie-react").then((m) => m.DotLottieReact), {
  ssr: false,
  loading: () => null,
})

const DURACAO_MS = 2200
const DURACAO_REDUZIDA_MS = 700

const FRASES = ["Apontando os satélites…", "Revelando a foto de hoje…", "Calculando as órbitas…", "Quase lá…"]

// o horizonte da Terra visto da órbita: noite no topo, a linha do Sol embaixo
const CORES = ["#08090d", "#0c1124", "#1b2a66", "#2b5bd7", "#ff5a1f", "#ffb547", "#fff1d6"]
const PARADAS = [38, 52, 62, 72, 82, 90, 100]

function GradienteQueRespira({ respirar }: { respirar: boolean }) {
  const caixa = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let quadro = 0
    let inicio: number | null = null
    const paradas = PARADAS.map((p, i) => `${CORES[i]} ${p}%`).join(", ")
    const pintar = (agora: number) => {
      inicio ??= agora
      // respiração lenta: o raio do gradiente pulsa ±5 pontos, como o brilho da atmosfera
      const r = 98 + (respirar ? Math.sin((agora - inicio) / 900) * 4 : 0)
      if (caixa.current) caixa.current.style.background = `radial-gradient(${r}% ${r + 14}% at 50% 0%, ${paradas})`
      quadro = requestAnimationFrame(pintar)
    }
    quadro = requestAnimationFrame(pintar)
    return () => cancelAnimationFrame(quadro)
  }, [respirar])
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0, scale: 1.4 }}
      animate={{ opacity: 1, scale: 1, transition: { duration: 1.6, ease: [0.25, 0.1, 0.25, 1] } }}
    >
      {/* o centro escuro fica no alto; as cores do anel aparecem embaixo, como o horizonte */}
      <div ref={caixa} className="absolute inset-0" />
    </motion.div>
  )
}

export function Abertura() {
  const [visivel, setVisivel] = useState(true)
  const [progresso, setProgresso] = useState(0)
  const [frase, setFrase] = useState(0)
  const [reduzido, setReduzido] = useState(false)
  const [gatoFalhou, setGatoFalhou] = useState(false)

  useEffect(() => {
    // aba aberta em segundo plano não precisa de abertura: quando a pessoa chegar, a página já está pronta
    if (document.visibilityState === "hidden") {
      setVisivel(false)
      return
    }
    const r = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
    setReduzido(r)
    const total = r ? DURACAO_REDUZIDA_MS : DURACAO_MS
    const html = document.documentElement
    html.style.overflow = "hidden"
    const inicio = performance.now()
    let quadro = 0
    const tick = (agora: number) => {
      const p = Math.min(1, (agora - inicio) / total)
      // a barra acelera no começo e respira no fim, como um download de verdade
      setProgresso(1 - (1 - p) ** 2.2)
      setFrase(Math.min(FRASES.length - 1, Math.floor(p * FRASES.length)))
      if (p < 1) quadro = requestAnimationFrame(tick)
    }
    quadro = requestAnimationFrame(tick)
    // só sai quando o tempo mínimo passou E a página terminou de carregar
    const pronto = new Promise<void>((ok) => {
      if (document.readyState === "complete") ok()
      else window.addEventListener("load", () => ok(), { once: true })
    })
    const minimo = new Promise<void>((ok) => setTimeout(ok, total))
    let cancelado = false
    Promise.all([pronto, minimo]).then(() => !cancelado && setVisivel(false))
    // trava de segurança: nunca prende ninguém mais que 5 s
    const limite = setTimeout(() => !cancelado && setVisivel(false), 5000)
    return () => {
      cancelado = true
      cancelAnimationFrame(quadro)
      clearTimeout(limite)
      html.style.overflow = ""
    }
  }, [])

  return (
    <AnimatePresence onExitComplete={() => (document.documentElement.style.overflow = "")}>
      {visivel && (
        <motion.div
          key="abertura"
          role="status"
          aria-live="polite"
          aria-label="Carregando o Gatélite"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#08090d] text-white"
          exit={
            reduzido
              ? { opacity: 0, transition: { duration: 0.3 } }
              : { clipPath: "inset(0 0 100% 0)", transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] } }
          }
          style={{ clipPath: "inset(0 0 0% 0)" }}
        >
          <GradienteQueRespira respirar={!reduzido} />

          {/* estrelas finas por cima do gradiente */}
          <div className="estrelas pointer-events-none absolute inset-0 opacity-60" aria-hidden />

          <motion.div
            className="relative z-10 flex flex-col items-center px-6 text-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, y: -24, transition: { duration: 0.4 } }}
          >
            <div className="h-[132px] w-[185px] sm:h-[160px] sm:w-[224px]" aria-hidden>
              {gatoFalhou ? (
                <div className="grid h-full place-items-center">
                  <Simbolo className="size-20 text-white" titulo="" />
                </div>
              ) : (
                <DotLottieReact
                  src="/dados/gato-carregando.json"
                  loop
                  autoplay={!reduzido}
                  dotLottieRefCallback={(d) => d?.addEventListener("loadError", () => setGatoFalhou(true))}
                />
              )}
            </div>

            <div className="mt-4 flex items-center gap-2.5 text-white">
              <Simbolo className="size-7" titulo="" />
              <Logotipo className="h-[18px]" />
            </div>

            <div className="mt-8 h-1 w-56 overflow-hidden rounded-full bg-white/15 sm:w-64">
              <div
                className="h-full origin-left rounded-full"
                style={{
                  transform: `scaleX(${progresso})`,
                  background: "linear-gradient(90deg, #ffb547, #ff5a1f)",
                }}
              />
            </div>

            <div className="mt-4 h-5 overflow-hidden text-sm text-white/75">
              <AnimatePresence mode="wait">
                <motion.p
                  key={frase}
                  initial={{ y: 14, opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.35 } }}
                  exit={{ y: -14, opacity: 0, filter: "blur(4px)", transition: { duration: 0.2 } }}
                >
                  {FRASES[frase]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          <p className="absolute bottom-6 z-10 px-6 text-center text-[11px] text-white/45">
            A Terra de hoje, vista de cima · dados abertos da NASA
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
