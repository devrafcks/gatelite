"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { type FotoEpic, urlDaFotoEpic } from "@/domain/epic"
import { imagemOtimizada, preCarregar } from "@/lib/imagens"
import { numero } from "@/lib/formato"
import { cn } from "@/lib/utils"

// O hero que gira com a rolagem. A seção é alta e o palco fica preso (sticky): rolar
// não move a página por baixo, gira a Terra pelas fotos do dia, aproxima o planeta e
// troca a manchete pelo desfecho. Nada trava a rolagem: acabou a seção, a página segue.
// Com movimento reduzido, vira um hero parado.

const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const suave = (t: number) => t * t * (3 - 2 * t)
// a Terra ocupa metade da largura no desktop e quase tudo no celular
const TAMANHOS = "(min-width: 1024px) 50vw, 92vw"

export function HeroOrbital({
  fotos,
  topo,
  titulo,
  desfecho,
}: {
  fotos: readonly FotoEpic[]
  topo: React.ReactNode
  titulo: React.ReactNode
  desfecho: React.ReactNode
}) {
  const secao = useRef<HTMLElement>(null)
  const palco = useRef<HTMLDivElement>(null)
  const [quadro, setQuadro] = useState(0)
  const [prontas, setProntas] = useState<Set<number>>(() => new Set())
  const [reduzido, setReduzido] = useState(false)
  const n = fotos.length
  const atributos = useMemo(() => fotos.map((f) => imagemOtimizada(urlDaFotoEpic(f), TAMANHOS)), [fotos])

  useEffect(() => setReduzido(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false), [])

  // a primeira foto vem na hora; as outras, uma de cada vez, sem disputar a banda com a página
  useEffect(() => {
    let cancelado = false
    const carregar = async () => {
      for (let i = 0; i < fotos.length; i++) {
        if (cancelado) return
        await preCarregar(atributos[i] as ReturnType<typeof imagemOtimizada>)
        if (!cancelado) setProntas((s) => new Set(s).add(i))
      }
    }
    const ocioso = (window as Window & { requestIdleCallback?: (f: () => void) => number }).requestIdleCallback
    if (ocioso) ocioso(() => void carregar())
    else setTimeout(() => void carregar(), 300)
    return () => {
      cancelado = true
    }
  }, [atributos])

  useEffect(() => {
    if (reduzido) return
    const el = secao.current
    const p = palco.current
    if (!el || !p) return
    let alvo = 0
    let mostrado = 0
    let raf = 0
    let ultimoQuadro = -1

    const ler = () => {
      const r = el.getBoundingClientRect()
      const curso = Math.max(1, r.height - window.innerHeight)
      alvo = limitar(-r.top / curso)
      // o laço só roda enquanto há movimento: parado, não gasta nada
      if (!raf) raf = requestAnimationFrame(pintar)
    }
    const pintar = () => {
      mostrado += (alvo - mostrado) * 0.14
      if (Math.abs(alvo - mostrado) < 0.0005) mostrado = alvo
      const prog = mostrado
      // o filme ocupa 85% do curso; o resto é pouso, com o desfecho no ar
      const filme = limitar(prog / 0.85)
      const titulo = 1 - limitar(filme / 0.32)
      const fim = suave(limitar((filme - 0.72) / 0.28))
      const aproxima = suave(limitar(filme / 0.9))
      p.style.setProperty("--p", prog.toFixed(4))
      p.style.setProperty("--titulo", titulo.toFixed(3))
      p.style.setProperty("--fim", fim.toFixed(3))
      p.style.setProperty("--aproxima", aproxima.toFixed(3))
      p.style.setProperty("--dica", prog > 0.015 ? "0" : "1")
      // o que sumiu não pode ser clicado
      p.dataset.saiu = titulo < 0.1 ? "sim" : "nao"
      p.dataset.chegou = fim > 0.6 ? "sim" : "nao"
      const q = Math.min(n - 1, Math.floor(filme * n))
      if (q !== ultimoQuadro) {
        ultimoQuadro = q
        setQuadro(q)
      }
      raf = mostrado === alvo ? 0 : requestAnimationFrame(pintar)
    }
    ler()
    addEventListener("scroll", ler, { passive: true })
    addEventListener("resize", ler)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener("scroll", ler)
      removeEventListener("resize", ler)
    }
  }, [n, reduzido])

  const foto = fotos[quadro] ?? fotos[0]

  return (
    <section ref={secao} className={cn("relative", reduzido ? "h-auto" : "h-[260svh]")} aria-label="A Terra de hoje">
      <div ref={palco} className="hero-orbital estrelas sticky top-0 flex h-svh min-h-[620px] flex-col overflow-hidden">
        <div className="hero-orbital__halo" aria-hidden />
        <div className="relative z-20">{topo}</div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center px-4 md:px-6 lg:grid-cols-12">
          <div className="hero-orbital__titulo relative z-10 lg:col-span-6">{titulo}</div>
        </div>

        {/* a Terra: começa à direita, vem para o centro e cresce */}
        <div className="hero-orbital__terra" aria-hidden={false}>
          <div className="relative aspect-square w-full overflow-hidden rounded-full">
            {fotos.map((f, i) => {
              // no DOM só a foto da vez e as vizinhas (já baixadas): 13 fotos decodificadas
              // ao mesmo tempo pesavam dezenas de MB de memória de vídeo
              const visivel = prontas.has(quadro) ? quadro : 0
              if (i !== 0 && (!prontas.has(i) || Math.abs(i - visivel) > 1)) return null
              const a = atributos[i]
              return (
                // biome-ignore lint/performance/noImgElement: imagens externas da NASA, já otimizadas
                <img
                  key={f.id}
                  src={a?.src}
                  srcSet={a?.srcSet}
                  sizes={a?.sizes}
                  alt={i === quadro ? `A Terra fotografada pela câmera EPIC às ${f.data.slice(11, 16)} UTC de ${f.data.slice(0, 10)}` : ""}
                  className={cn(
                    // troca seca, quadro a quadro: é um scrub, não um slideshow
                    "absolute inset-0 h-full w-full scale-[1.2] object-cover",
                    i === visivel ? "opacity-100" : "opacity-0",
                  )}
                  draggable={false}
                  decoding={i === 0 ? "sync" : "async"}
                  fetchPriority={i === 0 ? "high" : "low"}
                />
              )
            })}
          </div>
          {foto && (
            <p className="hero-orbital__legenda numero">
              {foto.data.slice(11, 16)} UTC · centro em {numero(Math.abs(foto.centro.lng), 0)}° {foto.centro.lng >= 0 ? "L" : "O"}
            </p>
          )}
        </div>

        <div className="hero-orbital__desfecho">{desfecho}</div>

        <div className="hero-orbital__dica" aria-hidden>
          <span>role para girar a Terra</span>
          <svg width="14" height="18" viewBox="0 0 14 18" aria-hidden>
            <path d="M7 1V17M2 12L7 17L12 12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 h-0.5 bg-white/10" aria-hidden>
          <div className="hero-orbital__barra h-full origin-left" />
        </div>
      </div>
    </section>
  )
}
