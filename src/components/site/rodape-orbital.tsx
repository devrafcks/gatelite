"use client"

import { IconArrowUp } from "@tabler/icons-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { Logo } from "@/components/brand/logo"
import { CORES, LOGOTIPO } from "@/components/brand/marca-dados"
import { cn } from "@/lib/utils"
import { Adesivo, ROTULOS_ADESIVO, type TipoAdesivo } from "./adesivos"

// O rodapé: uma moldura escura, um painel de céu noturno com três colunas e o GATÉLITE
// gigante afundando na borda de baixo, com adesivos colados por cima.
//
// A coreografia: quando o rodapé entra na tela, o painel cresce, as colunas sobem, o
// logotipo se desenha num traço contínuo e cada adesivo bate no lugar quando o traço
// passa por baixo dele. Depois vira brinquedo: arraste os adesivos (eles inclinam com o
// arremesso), dê dois cliques para mandar um de volta, clique no GATÉLITE para desenhar de novo.

type Coluna = { tag: string; itens: { rotulo: string; href: string }[] }

const COLUNAS: Coluna[] = [
  {
    tag: "ver de cima",
    itens: [
      { rotulo: "Explorar um lugar", href: "/explorar" },
      { rotulo: "A Terra hoje", href: "/planeta" },
      { rotulo: "Satélites ao vivo", href: "/satelites" },
    ],
  },
  {
    tag: "o que é seu",
    itens: [
      { rotulo: "Lugares salvos", href: "/lugares" },
      { rotulo: "Linha do tempo", href: "/explorar?aba=tempo" },
      { rotulo: "Eventos perto", href: "/explorar?aba=eventos" },
    ],
  },
]

// onde cada adesivo cola, em % da caixa do logotipo: em cima das letras, inclinados
const ADESIVOS: { tipo: TipoAdesivo; x: number; y: number; tamanho: number; giro: number; prof: number }[] = [
  { tipo: "selo", x: 10, y: -6, tamanho: 9.5, giro: -10, prof: 1 },
  { tipo: "satelite", x: 24, y: -16, tamanho: 9.5, giro: 12, prof: 0.6 },
  { tipo: "planeta", x: 41, y: -4, tamanho: 10, giro: -6, prof: 1.1 },
  { tipo: "cometa", x: 57, y: -18, tamanho: 8, giro: 8, prof: 0.7 },
  { tipo: "lua", x: 71, y: -6, tamanho: 7.5, giro: -14, prof: 0.9 },
  { tipo: "simbolo", x: 83, y: -16, tamanho: 8.5, giro: 7, prof: 0.5 },
  { tipo: "pino", x: 92, y: -2, tamanho: 7, giro: -8, prof: 1.2 },
]

const TRACO_DURACAO = 2.2
const TRACO_INICIO = 0.9

type Pos = { x: number; y: number }
const limitar = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export function RodapeOrbital() {
  const raiz = useRef<HTMLElement>(null)
  const palco = useRef<HTMLDivElement>(null)
  const traco = useRef<SVGGElement>(null)
  const [visto, setVisto] = useState(false)
  const [rodada, setRodada] = useState(0)
  const [copiado, setCopiado] = useState(false)
  const [movidos, setMovidos] = useState<Record<number, Pos>>({})
  const [ordem, setOrdem] = useState<number[]>([])
  const arraste = useRef<{
    i: number
    id: number
    x0: number
    y0: number
    px: number
    py: number
    lx: number
    t: number
    giro: number
    w: number
    h: number
    andou: boolean
  } | null>(null)

  // comprimento real de cada contorno, para o traço se desenhar
  useEffect(() => {
    traco.current?.querySelectorAll<SVGPathElement>("path").forEach((p) => {
      p.style.setProperty("--l", `${Math.ceil(p.getTotalLength()) + 2}px`)
    })
  }, [rodada])

  // a coreografia roda uma vez, quando um quinto do rodapé aparece
  useEffect(() => {
    const el = raiz.current
    if (!el || typeof IntersectionObserver === "undefined") return setVisto(true)
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setVisto(true)
          io.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // ligado à rolagem: o painel cresce enquanto o rodapé ocupa a tela
  useEffect(() => {
    const el = raiz.current
    if (!el) return
    let quadro = 0
    const atualizar = () => {
      quadro = 0
      const r = el.getBoundingClientRect()
      const vh = document.documentElement.clientHeight || r.height
      const p = limitar((vh - r.top) / (Math.min(r.height, vh) || 1), 0, 1)
      el.style.setProperty("--ro-sp", (1 - (1 - p) ** 2).toFixed(4))
    }
    const rolar = () => {
      if (!quadro) quadro = requestAnimationFrame(atualizar)
    }
    atualizar()
    addEventListener("scroll", rolar, { passive: true })
    addEventListener("resize", rolar)
    return () => {
      cancelAnimationFrame(quadro)
      removeEventListener("scroll", rolar)
      removeEventListener("resize", rolar)
    }
  }, [])

  useEffect(() => {
    if (!copiado) return
    const t = setTimeout(() => setCopiado(false), 2200)
    return () => clearTimeout(t)
  }, [copiado])

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin)
      setCopiado(true)
    } catch {
      // sem permissão de área de transferência: não faz nada
    }
  }

  const reduzido = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  const balancar = (el: Element | null | undefined, quadros: Keyframe[], ms: number) => {
    if (!reduzido()) (el as HTMLElement | null)?.animate?.(quadros, { duration: ms, easing: "cubic-bezier(.3,1.4,.4,1)" })
  }
  const BATIDA: Keyframe[] = [
    { transform: "scale(1.14)" },
    { transform: "scale(.93,1.04)", offset: 0.4 },
    { transform: "scale(1.02,.98)", offset: 0.7 },
    { transform: "none" },
  ]
  const SACUDIDA: Keyframe[] = [
    { transform: "none" },
    { transform: "rotate(-14deg) scale(1.1)", offset: 0.3 },
    { transform: "rotate(9deg)", offset: 0.6 },
    { transform: "none" },
  ]

  const posicao = (i: number): Pos => movidos[i] ?? { x: ADESIVOS[i]!.x, y: ADESIVOS[i]!.y }
  const trazerParaFrente = (i: number) => setOrdem((o) => [...o.filter((k) => k !== i), i])
  const mandarDeVolta = useCallback((i: number, botao: HTMLElement) => {
    setMovidos((m) => {
      const n = { ...m }
      delete n[i]
      return n
    })
    balancar(botao.querySelector(".ro-ad-erguer"), BATIDA, 420)
    // biome-ignore lint/correctness/useExhaustiveDependencies: quadros são constantes
  }, [])

  const aoApertar = (e: React.PointerEvent<HTMLButtonElement>, i: number) => {
    if (e.button !== 0 || !palco.current) return
    const r = palco.current.getBoundingClientRect()
    const p = posicao(i)
    e.currentTarget.setPointerCapture(e.pointerId)
    arraste.current = { i, id: e.pointerId, x0: p.x, y0: p.y, px: e.clientX, py: e.clientY, lx: e.clientX, t: performance.now(), giro: 0, w: r.width, h: r.height, andou: false }
    trazerParaFrente(i)
  }
  const aoMover = (e: React.PointerEvent<HTMLButtonElement>) => {
    const a = arraste.current
    if (!a || a.id !== e.pointerId) return
    const dx = e.clientX - a.px
    const dy = e.clientY - a.py
    if (!a.andou && Math.hypot(dx, dy) < 4) return
    const host = e.currentTarget.parentElement
    if (!host) return
    if (!a.andou) host.classList.add("ro-arrastando")
    a.andou = true
    host.style.left = `${limitar(a.x0 + (dx / a.w) * 100, 1, 99)}%`
    host.style.top = `${limitar(a.y0 + (dy / a.h) * 100, -80, 90)}%`
    // inclina com o arremesso: a velocidade, suavizada
    const agora = performance.now()
    const v = (e.clientX - a.lx) / Math.max(1, agora - a.t)
    a.giro = a.giro * 0.75 + limitar(v * 22, -24, 24) * 0.25
    a.lx = e.clientX
    a.t = agora
    host.style.setProperty("--inclina", `${a.giro.toFixed(2)}deg`)
  }
  const aoSoltar = (e: React.PointerEvent<HTMLButtonElement>) => {
    const a = arraste.current
    if (!a || a.id !== e.pointerId) return
    arraste.current = null
    const host = e.currentTarget.parentElement
    host?.classList.remove("ro-arrastando")
    host?.style.setProperty("--inclina", "0deg")
    const erguer = e.currentTarget.querySelector(".ro-ad-erguer")
    if (a.andou && host) {
      setMovidos((m) => ({ ...m, [a.i]: { x: Number.parseFloat(host.style.left), y: Number.parseFloat(host.style.top) } }))
      balancar(erguer, BATIDA, 420)
    } else balancar(erguer, SACUDIDA, 520)
  }
  const aoTeclar = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const passo = e.shiftKey ? 6 : 2
    const p = posicao(i)
    const setas: Record<string, [number, number]> = {
      ArrowLeft: [-passo, 0],
      ArrowRight: [passo, 0],
      ArrowUp: [0, -passo],
      ArrowDown: [0, passo],
    }
    const s = setas[e.key]
    if (s) {
      e.preventDefault()
      trazerParaFrente(i)
      setMovidos((m) => ({ ...m, [i]: { x: limitar(p.x + s[0], 1, 99), y: limitar(p.y + s[1], -80, 90) } }))
    } else if (e.key === "Escape" || e.key === "Home") {
      e.preventDefault()
      mandarDeVolta(i, e.currentTarget)
    }
  }

  const desenharDeNovo = () => {
    setMovidos({})
    setRodada((r) => r + 1)
  }

  // paralaxe leve dos adesivos com o mouse
  const aoPassar = (e: React.PointerEvent<HTMLElement>) => {
    const el = raiz.current
    if (!el || e.pointerType !== "mouse") return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--ro-px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3))
    el.style.setProperty("--ro-py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3))
  }

  // caixa do logotipo; ele pousa na borda de baixo, quase inteiro à vista
  const pad = 2
  const vbX = -pad
  const vbY = LOGOTIPO.topo - pad
  const vbW = LOGOTIPO.largura + pad * 2
  const vbH = LOGOTIPO.base - LOGOTIPO.topo + pad * 2
  const afunda = 0.02

  return (
    <footer
      ref={raiz}
      className={cn("ro nao-imprimir", visto && "ro-entrou")}
      onPointerMove={aoPassar}
      onPointerLeave={() => {
        raiz.current?.style.setProperty("--ro-px", "0")
        raiz.current?.style.setProperty("--ro-py", "0")
      }}
    >
      <div className="ro-topo">
        <Link href="/explorar" className="ro-estrela" aria-label="Explorar um lugar">
          <svg viewBox="-50 -50 100 100" aria-hidden="true">
            <path
              d="M0 -48L9 -22L36 -33L22 -9L48 0L22 9L36 33L9 22L0 48L-9 22L-36 33L-22 9L-48 0L-22 -9L-36 -33L-9 -22Z"
              fill="currentColor"
            />
          </svg>
          <span>ver</span>
        </Link>
        <Link href="/" className="ro-logo" aria-label="Gatélite, página inicial">
          <Logo />
        </Link>
        <button
          type="button"
          className="ro-subir"
          onClick={() => window.scrollTo({ top: 0, behavior: reduzido() ? "auto" : "smooth" })}
          aria-label="Voltar ao topo"
        >
          <IconArrowUp className="size-5" stroke={1.75} />
        </button>
      </div>

      <div className="ro-painel">
        <div className="ro-colunas">
          {COLUNAS.map((c, k) => (
            <div key={c.tag} className="ro-coluna" style={{ "--c": k } as React.CSSProperties}>
              <h2 className="ro-tag">{c.tag}</h2>
              <ul className="ro-grande">
                {c.itens.map((it, i) => (
                  <li key={it.href} className="ro-linha" style={{ "--i": i } as React.CSSProperties}>
                    <Link href={it.href}>{it.rotulo}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="ro-coluna" style={{ "--c": 2 } as React.CSSProperties}>
            <h2 className="ro-tag">leve junto</h2>
            <ul className="ro-grande">
              <li className="ro-linha" style={{ "--i": 0 } as React.CSSProperties}>
                <button type="button" className={cn("ro-copiar", copiado && "ro-copiado")} onClick={copiar}>
                  <span className="ro-copiar-a">Copiar o link</span>
                  <span className="ro-copiar-b" aria-hidden="true">
                    copiado, manda pra alguém!
                  </span>
                </button>
              </li>
              <li className="ro-linha" style={{ "--i": 1 } as React.CSSProperties}>
                <Link href="/marca">
                  Marca e assets<span className="ro-ast">*</span>
                </Link>
              </li>
            </ul>
            <Link href="/sobre" className="ro-fontes">
              Sobre as fontes dos dados
              <svg viewBox="0 0 88 8" preserveAspectRatio="none" aria-hidden="true">
                <path d="M1 5C7 1 11 1 15 4S24 8 29 4S38 0 43 4S52 8 57 4S66 1 71 4S80 7 87 3" />
              </svg>
            </Link>
            <p className="ro-nota">
              *Projeto independente, feito com dados abertos. Sem ligação oficial com a NASA. Nada é rastreado, nada é
              vendido.
            </p>
            <span className="sr-only" role="status">
              {copiado ? "Link copiado" : ""}
            </span>
          </div>
        </div>

        <div className="ro-palco">
          <div
            className="ro-palco-dentro"
            ref={palco}
            style={{ marginBottom: `${-((vbH * afunda) / vbW) * 100}%` }}
          >
            <button type="button" className="ro-marca-botao" onClick={desenharDeNovo} aria-label="Desenhar o GATÉLITE de novo">
              <svg key={rodada} className="ro-marca" viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`} aria-hidden="true">
                <g ref={traco}>
                  <path
                    d={LOGOTIPO.d}
                    className="ro-contorno"
                    style={{ "--dur": `${TRACO_DURACAO}s`, "--em": `${TRACO_INICIO}s` } as React.CSSProperties}
                  />
                  <path
                    d={LOGOTIPO.destaque}
                    className="ro-contorno ro-contorno-sol"
                    style={{ "--dur": ".5s", "--em": `${TRACO_INICIO + TRACO_DURACAO * 0.62}s`, color: CORES.laranja } as React.CSSProperties}
                  />
                </g>
              </svg>
            </button>

            {ADESIVOS.map((a, i) => {
              const p = posicao(i)
              return (
                <div
                  key={a.tipo}
                  className="ro-ad"
                  style={
                    {
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      width: `max(${a.tamanho}cqw, 42px)`,
                      zIndex: 3 + Math.max(0, ordem.indexOf(i) + 1),
                      "--giro": `${a.giro}deg`,
                      "--prof": a.prof,
                      // bate no lugar quando o traço passa por baixo
                      "--em": `${(TRACO_INICIO + TRACO_DURACAO * (a.x / 100) ** 0.92 + 0.1).toFixed(2)}s`,
                    } as React.CSSProperties
                  }
                >
                  <button
                    type="button"
                    className="ro-ad-botao"
                    aria-label={`${ROTULOS_ADESIVO[a.tipo]}. Arraste, ou use as setas, para mover. Esc devolve ao lugar.`}
                    onPointerDown={(e) => aoApertar(e, i)}
                    onPointerMove={aoMover}
                    onPointerUp={aoSoltar}
                    onPointerCancel={aoSoltar}
                    onDoubleClick={(e) => mandarDeVolta(i, e.currentTarget)}
                    onKeyDown={(e) => aoTeclar(e, i)}
                  >
                    <span key={rodada} className="ro-ad-bater">
                      <span className="ro-ad-erguer">
                        <Adesivo tipo={a.tipo} />
                      </span>
                    </span>
                  </button>
                  <span key={`anel${rodada}`} className="ro-anel" aria-hidden="true" />
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </footer>
  )
}
