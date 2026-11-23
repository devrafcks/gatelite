import { IconArrowLeft, IconMap2 } from "@tabler/icons-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Cabecalho } from "@/components/site/navegacao"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Fora da faixa",
  robots: { index: false },
}

// 404: a página caiu fora da faixa que o satélite varre. Um sensor passa, a linha de
// varredura desce pela faixa, e o seu ponto fica do lado de fora, sem imagem.
export default function NaoEncontrada() {
  return (
    <div className="estrelas relative flex min-h-svh flex-col overflow-hidden bg-background text-foreground">
      <Cabecalho />
      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 pb-24 text-center md:px-6">
        <svg viewBox="0 0 640 300" className="w-full max-w-[38rem]" role="img" aria-label="Um satélite varre uma faixa do chão; o ponto procurado ficou fora dela">
          <defs>
            <linearGradient id="nf-faixa" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffb547" stopOpacity="0.02" />
              <stop offset="1" stopColor="#ffb547" stopOpacity="0.16" />
            </linearGradient>
            <linearGradient id="nf-varredura" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ff5a1f" stopOpacity="0" />
              <stop offset="0.5" stopColor="#ff5a1f" stopOpacity="0.9" />
              <stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
            </linearGradient>
            <clipPath id="nf-recorte">
              <polygon points="300,40 340,40 430,250 210,250" />
            </clipPath>
          </defs>

          {/* o chão: um horizonte pontilhado, curvo como o planeta */}
          <g fill="rgb(214 212 206 / 0.45)">
            {Array.from({ length: 64 }, (_, i) => {
              const x = 10 + i * 9.8
              const y = 250 + ((x - 320) / 320) ** 2 * 26
              return <circle key={i} cx={x} cy={y} r={1.4} />
            })}
          </g>

          {/* a faixa que o sensor enxerga */}
          <polygon points="300,40 340,40 430,250 210,250" fill="url(#nf-faixa)" />
          <path d="M300 40L210 250M340 40L430 250" stroke="#ffb547" strokeOpacity="0.45" strokeDasharray="3 5" />
          <g clipPath="url(#nf-recorte)">
            <rect className="nf-varredura" x="200" y="40" width="240" height="3" fill="url(#nf-varredura)" />
          </g>

          {/* o satélite */}
          <g transform="translate(320 30)">
            <rect x="-34" y="-6" width="22" height="12" rx="2" fill="#1d3a8f" stroke="#6ea0ff" strokeWidth="1" />
            <rect x="12" y="-6" width="22" height="12" rx="2" fill="#1d3a8f" stroke="#6ea0ff" strokeWidth="1" />
            <rect x="-12" y="-9" width="24" height="18" rx="4" fill="#e9e6df" />
            <rect x="-6" y="-4" width="12" height="5" rx="1.5" fill="#ff5a1f" />
          </g>

          {/* o ponto que ninguém fotografou */}
          <g transform="translate(528 262)">
            <circle r="16" fill="#ff5a1f" opacity="0.18" className="nf-pulso" />
            <circle r="5" fill="#fff" stroke="#ff5a1f" strokeWidth="2.5" />
            <path d="M0 -12V-44" stroke="rgb(255 255 255 / 0.35)" />
            <text x="0" y="-52" textAnchor="middle" fill="rgb(255 255 255 / 0.75)" fontSize="12" fontFamily="var(--font-geist-sans)">
              esta página
            </text>
          </g>
          <text x="320" y="292" textAnchor="middle" fill="rgb(255 255 255 / 0.4)" fontSize="11" fontFamily="var(--font-geist-mono)">
            erro 404 · fora da faixa · sem imagem
          </text>
        </svg>

        <h1 className="titulo-display mt-10 text-[clamp(2.6rem,7vw,5rem)] font-light text-balance">
          Fora da <span className="font-semibold">faixa.</span>
        </h1>
        <p className="mt-5 max-w-md text-muted-foreground text-pretty">
          Nenhum satélite passou por cima deste endereço. Ele pode ter mudado, ou foi digitado com um caractere a mais.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button render={<Link href="/" />} nativeButton={false} size="lg" variant="outline">
            <IconArrowLeft className="size-5" stroke={1.5} /> Voltar ao início
          </Button>
          <Button render={<Link href="/explorar" />} nativeButton={false} size="lg" variant="sol">
            <IconMap2 className="size-5" stroke={1.5} /> Explorar um lugar
          </Button>
        </div>
      </main>
    </div>
  )
}
