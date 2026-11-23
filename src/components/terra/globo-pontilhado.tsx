"use client"

import { geoGraticule, geoOrthographic, geoPath } from "d3-geo"
import { useEffect, useRef, useState } from "react"
import type { LatLng } from "@/domain/geo"
import { posicaoEm, rastroEntre } from "@/domain/orbitas"
import type { useFrota } from "@/lib/consultas"
import { cn } from "@/lib/utils"

// O globo pontilhado: continentes em meio-tom e, por cima, os satélites que o Gatélite
// acompanha, na posição de agora, com o rastro dos últimos minutos.
//
// Desempenho: os pontos dos continentes vêm prontos (scripts/gerar-pontos-terra.mjs) e
// viram vetores 3D uma vez só. A cada quadro, girar e projetar cada ponto custa algumas
// multiplicações; tudo é desenhado num caminho só. A animação roda a 30 quadros por
// segundo, pausa fora da tela ou com a aba escondida, e a densidade de pixels é limitada.

type Frota = ReturnType<typeof useFrota>["frota"]

// cos/sen de latitude e longitude de cada ponto, guardados lado a lado
let cachePontos: Promise<Float32Array> | null = null
const carregarPontos = () => {
  cachePontos ??= fetch("/dados/pontos-terra.json")
    .then((r) => r.json() as Promise<number[]>)
    .then((lista) => {
      const n = lista.length / 2
      const v = new Float32Array(n * 4)
      for (let i = 0; i < n; i++) {
        const lng = ((lista[i * 2] as number) * Math.PI) / 180
        const lat = ((lista[i * 2 + 1] as number) * Math.PI) / 180
        v[i * 4] = Math.cos(lat)
        v[i * 4 + 1] = Math.sin(lat)
        v[i * 4 + 2] = Math.cos(lng)
        v[i * 4 + 3] = Math.sin(lng)
      }
      return v
    })
  return cachePontos
}

const QUADRO_MS = 1000 / 30

export function GloboPontilhado({
  frota = [],
  marcador,
  destaque,
  aoEscolher,
  className,
  girar = true,
  inclinacao = -18,
}: {
  frota?: Frota
  marcador?: LatLng | null
  destaque?: number | null
  aoEscolher?: (norad: number) => void
  className?: string
  girar?: boolean
  inclinacao?: number
}) {
  const caixa = useRef<HTMLDivElement>(null)
  const tela = useRef<HTMLCanvasElement>(null)
  const [erro, setErro] = useState(false)
  const estado = useRef({ frota, marcador, destaque, aoEscolher })
  estado.current = { frota, marcador, destaque, aoEscolher }

  useEffect(() => {
    const canvas = tela.current
    const div = caixa.current
    const ctx = canvas?.getContext("2d", { alpha: true })
    if (!canvas || !div || !ctx) return

    let largura = 0
    let altura = 0
    let raio = 0
    const projecao = geoOrthographic().clipAngle(90)
    const caminho = geoPath(projecao, ctx)
    const grade = geoGraticule().step([30, 30])()
    const rotacao: [number, number, number] = [-(marcador?.lng ?? -50) + 20, inclinacao, 0]
    let pontos: Float32Array | null = null
    let rastros = new Map<number, [number, number][]>()
    let ultimoRastro = 0
    let arrastando: { x: number; y: number; r: [number, number, number]; id: number } | null = null
    let parado = 0
    let quadro = 0
    let ultimoDesenho = 0
    let naTela = true
    let posicoesNaTela: { norad: number; x: number; y: number }[] = []
    const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

    const medir = () => {
      const r = div.getBoundingClientRect()
      const dpr = Math.min(1.5, window.devicePixelRatio || 1)
      largura = r.width
      altura = r.height
      raio = Math.min(largura, altura) / 2.15
      canvas.width = Math.round(largura * dpr)
      canvas.height = Math.round(altura * dpr)
      canvas.style.width = `${largura}px`
      canvas.style.height = `${altura}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      projecao.scale(raio).translate([largura / 2, altura / 2])
      ultimoDesenho = 0
    }

    // ponto (lat, lng em graus) está no lado visível? mesmo critério da projeção do d3
    const visivel = (lng: number, lat: number) => {
      const r = Math.PI / 180
      const l = (lng + rotacao[0]) * r
      const x = Math.cos(lat * r) * Math.cos(l)
      const z = Math.sin(lat * r)
      const fi = rotacao[1] * r
      return x * Math.cos(fi) - z * Math.sin(fi) > 0.02
    }

    const desenhar = (agora: number) => {
      const { frota: f, marcador: m, destaque: d } = estado.current
      ctx.clearRect(0, 0, largura, altura)
      const cx = largura / 2
      const cy = altura / 2

      const halo = ctx.createRadialGradient(cx, cy, raio * 0.92, cx, cy, raio * 1.16)
      halo.addColorStop(0, "rgba(64,120,255,0.26)")
      halo.addColorStop(1, "rgba(64,120,255,0)")
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(cx, cy, raio * 1.16, 0, Math.PI * 2)
      ctx.fill()
      const oceano = ctx.createRadialGradient(cx - raio * 0.35, cy - raio * 0.4, raio * 0.1, cx, cy, raio)
      oceano.addColorStop(0, "#111a33")
      oceano.addColorStop(1, "#070a14")
      ctx.fillStyle = oceano
      ctx.beginPath()
      ctx.arc(cx, cy, raio, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "rgba(255,255,255,0.22)"
      ctx.lineWidth = 1
      ctx.stroke()

      projecao.rotate(rotacao)
      ctx.beginPath()
      caminho(grade)
      ctx.strokeStyle = "rgba(255,255,255,0.06)"
      ctx.lineWidth = 0.7
      ctx.stroke()

      // continentes: rotação e projeção ortográfica feitas à mão, sem chamar o d3 por ponto
      if (pontos) {
        const r = Math.PI / 180
        const cL = Math.cos(rotacao[0] * r)
        const sL = Math.sin(rotacao[0] * r)
        const cF = Math.cos(rotacao[1] * r)
        const sF = Math.sin(rotacao[1] * r)
        const lado = Math.max(1.2, raio / 200)
        ctx.fillStyle = "rgba(214,212,206,0.62)"
        ctx.beginPath()
        for (let i = 0; i < pontos.length; i += 4) {
          const cosLat = pontos[i] as number
          const sinLat = pontos[i + 1] as number
          const c = (pontos[i + 2] as number) * cL - (pontos[i + 3] as number) * sL
          const s = (pontos[i + 3] as number) * cL + (pontos[i + 2] as number) * sL
          const x = c * cosLat
          const X = x * cF - sinLat * sF
          if (X <= 0) continue
          const Y = s * cosLat
          const Z = sinLat * cF + x * sF
          ctx.rect(cx + raio * Y - lado / 2, cy - raio * Z - lado / 2, lado, lado)
        }
        ctx.fill()
      }

      if (f.length) {
        if (agora - ultimoRastro > 20_000) {
          ultimoRastro = agora
          const t = Date.now()
          rastros = new Map(
            f.map((s) => [s.sat.norad, rastroEntre(s.satrec, t - 25 * 60_000, t, 45).map((p) => [p.lng, p.lat] as [number, number])]),
          )
        }
        const t = new Date()
        posicoesNaTela = []
        for (const s of f) {
          const ativo = d === s.sat.norad
          const trilha = rastros.get(s.sat.norad)
          if (trilha?.length) {
            ctx.beginPath()
            caminho({ type: "LineString", coordinates: trilha })
            ctx.strokeStyle = ativo ? "rgba(255,90,31,0.95)" : "rgba(255,181,71,0.32)"
            ctx.lineWidth = ativo ? 2 : 1
            ctx.stroke()
          }
          const p = posicaoEm(s.satrec, t)
          if (!p || !visivel(p.lng, p.lat)) continue
          const xy = projecao([p.lng, p.lat])
          if (!xy) continue
          posicoesNaTela.push({ norad: s.sat.norad, x: xy[0], y: xy[1] })
          ctx.fillStyle = ativo ? "rgba(255,90,31,0.25)" : "rgba(255,90,31,0.16)"
          ctx.beginPath()
          ctx.arc(xy[0], xy[1], ativo ? 10 + Math.sin(agora / 260) * 3 : 7, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = ativo ? "#ff5a1f" : "#ffb547"
          ctx.beginPath()
          ctx.arc(xy[0], xy[1], ativo ? 4.5 : 3, 0, Math.PI * 2)
          ctx.fill()
          if (ativo || raio > 220) {
            ctx.font = `${ativo ? 600 : 500} 11px var(--font-geist-sans), system-ui`
            ctx.fillStyle = ativo ? "#ffffff" : "rgba(255,255,255,0.7)"
            ctx.fillText(s.sat.nome, xy[0] + 8, xy[1] - 7)
          }
        }
      }

      if (m && visivel(m.lng, m.lat)) {
        const p = projecao([m.lng, m.lat])
        if (p) {
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(p[0], p[1], 6, 0, Math.PI * 2)
          ctx.stroke()
          ctx.fillStyle = "#ff5a1f"
          ctx.beginPath()
          ctx.arc(p[0], p[1], 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const laco = (agora: number) => {
      quadro = requestAnimationFrame(laco)
      if (!naTela || document.hidden) return
      // arrastando: todo quadro; girando sozinho: 30 por segundo basta
      if (!arrastando && agora - ultimoDesenho < QUADRO_MS) return
      const dt = ultimoDesenho ? Math.min(100, agora - ultimoDesenho) : QUADRO_MS
      ultimoDesenho = agora
      if (girar && !reduzido && !arrastando && agora - parado > 1600) rotacao[0] += 0.0018 * dt
      desenhar(agora)
    }

    const apertar = (e: PointerEvent) => {
      arrastando = { x: e.clientX, y: e.clientY, r: [...rotacao] as [number, number, number], id: e.pointerId }
    }
    const mover = (e: PointerEvent) => {
      if (!arrastando) {
        if (e.pointerType !== "mouse") return
        const r = canvas.getBoundingClientRect()
        const perto = posicoesNaTela.some((p) => Math.hypot(p.x - (e.clientX - r.left), p.y - (e.clientY - r.top)) < 12)
        canvas.style.cursor = perto && estado.current.aoEscolher ? "pointer" : "grab"
        return
      }
      const dx = e.clientX - arrastando.x
      const dy = e.clientY - arrastando.y
      // no toque, só captura quando o gesto é mais horizontal: o vertical rola a página
      if (e.pointerType !== "mouse" && Math.abs(dy) > Math.abs(dx) * 1.2 && Math.abs(dx) < 8) return
      if (!canvas.hasPointerCapture(e.pointerId)) canvas.setPointerCapture(e.pointerId)
      const k = 280 / raio
      rotacao[0] = arrastando.r[0] + dx * k
      if (e.pointerType === "mouse") rotacao[1] = Math.max(-80, Math.min(80, arrastando.r[1] - dy * k))
    }
    const soltar = (e: PointerEvent) => {
      const a = arrastando
      arrastando = null
      parado = performance.now()
      if (a && Math.hypot(e.clientX - a.x, e.clientY - a.y) < 6) {
        const r = canvas.getBoundingClientRect()
        const alvo = posicoesNaTela.find((p) => Math.hypot(p.x - (e.clientX - r.left), p.y - (e.clientY - r.top)) < 14)
        if (alvo) estado.current.aoEscolher?.(alvo.norad)
      }
    }

    const ro = new ResizeObserver(medir)
    ro.observe(div)
    const io = new IntersectionObserver((es) => {
      naTela = es.some((x) => x.isIntersecting)
    })
    io.observe(div)
    medir()
    canvas.addEventListener("pointerdown", apertar)
    canvas.addEventListener("pointermove", mover)
    canvas.addEventListener("pointerup", soltar)
    canvas.addEventListener("pointercancel", soltar)
    carregarPontos()
      .then((p) => {
        pontos = p
      })
      .catch(() => setErro(true))
    quadro = requestAnimationFrame(laco)

    return () => {
      cancelAnimationFrame(quadro)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener("pointerdown", apertar)
      canvas.removeEventListener("pointermove", mover)
      canvas.removeEventListener("pointerup", soltar)
      canvas.removeEventListener("pointercancel", soltar)
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: o globo nasce uma vez; dados vivos vêm pelo ref
  }, [girar, inclinacao])

  return (
    <div ref={caixa} className={cn("relative aspect-square w-full touch-pan-y select-none", className)}>
      <canvas ref={tela} className="absolute inset-0" aria-label="Globo com a posição dos satélites agora" role="img" />
      {erro && (
        <p className="absolute inset-x-0 bottom-4 text-center text-xs text-muted-foreground">
          Não deu para carregar os continentes.
        </p>
      )}
    </div>
  )
}
