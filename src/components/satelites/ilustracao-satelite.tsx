import { useId } from "react"
import type { Satelite } from "@/domain/satelites"

const MANTAS: Record<Satelite["familia"], [string, string, string]> = {
  "alta-resolucao": ["#f6d27a", "#c8902e", "#7a4f12"],
  "nasa-diaria": ["#e9edf3", "#a9b3c2", "#5d6878"],
  brasil: ["#f4f3f1", "#c9ccd3", "#7d8391"],
  estacao: ["#e9edf3", "#9aa3b2", "#4f5869"],
}

export function IlustracaoSatelite({ familia, className }: { familia: Satelite["familia"]; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "")
  const [claro, medio, escuro] = MANTAS[familia]
  return (
    <svg viewBox="0 0 320 220" className={className} aria-hidden>
      <defs>
        <radialGradient id={`${id}brilho`} cx="0.55" cy="0.45" r="0.55">
          <stop offset="0" stopColor="#5b7cff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#5b7cff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}painel`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2c56c9" />
          <stop offset="0.55" stopColor="#13285f" />
          <stop offset="1" stopColor="#0a1636" />
        </linearGradient>
        <linearGradient id={`${id}reflexo`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}topo`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={claro} />
          <stop offset="1" stopColor={medio} />
        </linearGradient>
        <linearGradient id={`${id}frente`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={medio} />
          <stop offset="1" stopColor={escuro} />
        </linearGradient>
        <linearGradient id={`${id}lado`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={escuro} />
          <stop offset="1" stopColor="#1c1408" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <ellipse cx="180" cy="110" rx="150" ry="100" fill={`url(#${id}brilho)`} />

      <polygon points="10,128 150,96 152,128 14,168" fill={`url(#${id}painel)`} />
      {Array.from({ length: 6 }, (_, i) => {
        const t = (i + 1) / 7
        return (
          <line
            key={i}
            x1={10 + 140 * t}
            y1={128 - 32 * t}
            x2={14 + 138 * t}
            y2={168 - 40 * t}
            stroke="#6ea0ff"
            strokeOpacity="0.45"
            strokeWidth="1"
          />
        )
      })}
      <line x1="12" y1="148" x2="151" y2="112" stroke="#6ea0ff" strokeOpacity="0.45" strokeWidth="1" />
      <polygon points="10,128 150,96 152,128 14,168" fill={`url(#${id}reflexo)`} />
      <rect x="148" y="106" width="20" height="5" rx="2" fill="#9aa3b2" transform="rotate(-12 158 108)" />

      <polygon points="166,62 222,52 254,72 198,82" fill={`url(#${id}topo)`} />
      <polygon points="166,62 198,82 198,152 166,134" fill={`url(#${id}frente)`} />
      <polygon points="198,82 254,72 254,136 198,152" fill={`url(#${id}lado)`} />
      <path d="M172 80L192 92M170 102L194 116M172 122L192 134" stroke={claro} strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M206 96L246 88M206 120L246 110" stroke={claro} strokeOpacity="0.18" strokeWidth="1.5" />

      <rect x="212" y="138" width="22" height="16" rx="3" fill="#20242e" />
      <ellipse cx="223" cy="154" rx="11" ry="4" fill="#0b0d12" />
      <ellipse cx="223" cy="153" rx="5" ry="2" fill="#ff5a1f" opacity="0.85" />
      <line x1="236" y1="64" x2="246" y2="40" stroke="#c9ccd3" strokeWidth="2" />
      <ellipse cx="248" cy="36" rx="12" ry="5" fill="#e9edf3" transform="rotate(-20 248 36)" />

      <ellipse cx="190" cy="198" rx="90" ry="8" fill="#000" opacity="0.35" />
    </svg>
  )
}
