import { useId } from "react"
import { DesenhoDoSimbolo } from "@/components/brand/logo"

export type TipoAdesivo = "selo" | "satelite" | "planeta" | "cometa" | "lua" | "simbolo" | "pino"

export const ROTULOS_ADESIVO: Record<TipoAdesivo, string> = {
  selo: "Adesivo redondo escrito olha pra cima",
  satelite: "Adesivo de satélite",
  planeta: "Adesivo de planeta com anel",
  cometa: "Adesivo de cometa",
  lua: "Adesivo de lua crescente",
  simbolo: "Adesivo do gato do Gatélite",
  pino: "Adesivo de você está aqui",
}

const PAPEL = "#f4f3f1"
const TINTA = "#0e0e12"
const SOL = "#ff5a1f"
const AZUL = "#2b5bd7"

const desenho = (tipo: TipoAdesivo, id: string): { silhueta: React.ReactNode; arte: React.ReactNode } => {
  switch (tipo) {
    case "selo":
      return {
        silhueta: <circle cx="60" cy="60" r="52" />,
        arte: (
          <>
            <defs>
              <path id={`${id}t`} d="M60 60m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0" />
            </defs>
            <circle cx="60" cy="60" r="52" fill={TINTA} />
            <text
              fontFamily="var(--font-display-face)"
              fontWeight="700"
              fontSize="11.5"
              letterSpacing="2.2"
              fill={PAPEL}
              style={{ fontStretch: "125%" }}
            >
              <textPath href={`#${id}t`} textLength="236" lengthAdjust="spacingAndGlyphs">
                OLHA PRA CIMA · OLHA PRA CIMA ·
              </textPath>
            </text>
            <path d="M60 40C61.5 53 67 58.5 80 60C67 61.5 61.5 67 60 80C58.5 67 53 61.5 40 60C53 58.5 58.5 53 60 40Z" fill={SOL} />
          </>
        ),
      }
    case "satelite":
      return {
        silhueta: (
          <>
            <rect x="4" y="44" width="38" height="32" rx="3" />
            <rect x="78" y="44" width="38" height="32" rx="3" />
            <rect x="42" y="34" width="36" height="52" rx="6" />
          </>
        ),
        arte: (
          <>
            {[4, 78].map((x) => (
              <g key={x}>
                <rect x={x} y="44" width="38" height="32" rx="3" fill={AZUL} />
                {[0, 1, 2].map((i) => (
                  <rect key={i} x={x + 4 + i * 11.5} y="48" width="7.5" height="24" rx="1.5" fill={PAPEL} opacity="0.92" />
                ))}
              </g>
            ))}
            <rect x="42" y="34" width="36" height="52" rx="6" fill={PAPEL} />
            {[44, 52, 60].map((y) => (
              <rect key={y} x="48" y={y} width="24" height="4" rx="2" fill={TINTA} />
            ))}
            <circle cx="60" cy="76" r="5" fill={SOL} />
          </>
        ),
      }
    case "planeta":
      return {
        silhueta: (
          <>
            <circle cx="60" cy="60" r="38" />
            <ellipse cx="60" cy="62" rx="58" ry="15" transform="rotate(-14 60 62)" />
          </>
        ),
        arte: (
          <>
            <defs>
              <clipPath id={`${id}p`}>
                <circle cx="60" cy="60" r="38" />
              </clipPath>
            </defs>
            <ellipse cx="60" cy="62" rx="54" ry="12" transform="rotate(-14 60 62)" fill="none" stroke={SOL} strokeWidth="5" />
            <circle cx="60" cy="60" r="38" fill={PAPEL} />
            <g clipPath={`url(#${id}p)`} fill={TINTA}>
              {[30, 40, 50, 60, 70, 80, 90].map((y) => (
                <rect key={y} x="18" y={y} width="84" height="5" rx="2.5" />
              ))}
            </g>
            <path d="M7.6 75.1A54 12 -14 0 0 112.4 48.9" fill="none" stroke={SOL} strokeWidth="5" strokeLinecap="round" />
          </>
        ),
      }
    case "cometa":
      return {
        silhueta: (
          <>
            <circle cx="82" cy="38" r="22" />
            <path d="M68 52L22 98M78 58L40 96M60 44L16 82" stroke="#fff" strokeWidth="14" strokeLinecap="round" />
          </>
        ),
        arte: (
          <>
            <path d="M66 54L24 96" stroke={PAPEL} strokeWidth="7" strokeLinecap="round" />
            <path d="M76 60L42 94" stroke={AZUL} strokeWidth="7" strokeLinecap="round" />
            <path d="M60 46L18 80" stroke={AZUL} strokeWidth="7" strokeLinecap="round" />
            <circle cx="82" cy="38" r="22" fill={SOL} />
            <circle cx="88" cy="32" r="7" fill="#ffb547" />
          </>
        ),
      }
    case "lua":
      return {
        silhueta: <path d="M76 10A50 50 0 1 0 110 84A42 42 0 1 1 76 10Z" />,
        arte: (
          <>
            <defs>
              <clipPath id={`${id}l`}>
                <path d="M76 10A50 50 0 1 0 110 84A42 42 0 1 1 76 10Z" />
              </clipPath>
            </defs>
            <path d="M76 10A50 50 0 1 0 110 84A42 42 0 1 1 76 10Z" fill={PAPEL} />
            <g clipPath={`url(#${id}l)`} fill="none" stroke={TINTA} strokeWidth="4.5">
              <path d="M20 30C10 60 26 96 60 104" />
              <path d="M30 22C20 56 36 88 70 96" opacity="0.55" />
            </g>
          </>
        ),
      }
    case "simbolo":
      return {
        silhueta: <rect x="10" y="10" width="100" height="100" rx="24" />,
        arte: (
          <>
            <rect x="10" y="10" width="100" height="100" rx="24" fill={TINTA} />
            <g transform="translate(20 18) scale(0.68)">
              <DesenhoDoSimbolo id={`${id}s`} cor={PAPEL} />
            </g>
          </>
        ),
      }
    default:
      return {
        silhueta: <path d="M60 6C37 6 20 23 20 46C20 76 60 114 60 114C60 114 100 76 100 46C100 23 83 6 60 6Z" />,
        arte: (
          <>
            <path d="M60 6C37 6 20 23 20 46C20 76 60 114 60 114C60 114 100 76 100 46C100 23 83 6 60 6Z" fill={TINTA} />
            <circle cx="60" cy="45" r="22" fill={SOL} />
            <circle cx="60" cy="45" r="13" fill={TINTA} />
            <circle cx="60" cy="45" r="6" fill={PAPEL} />
          </>
        ),
      }
  }
}

export function Adesivo({ tipo }: { tipo: TipoAdesivo }) {
  const id = `ad${useId().replace(/[^a-zA-Z0-9]/g, "")}`
  const { silhueta, arte } = desenho(tipo, id)
  return (
    <svg viewBox="-8 -8 136 136" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`${id}c`}>{silhueta}</clipPath>
        <linearGradient id={`${id}g`} x1="0" x2="1" y1="0" y2="0">
          <stop offset=".35" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".4" />
          <stop offset=".65" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g fill={PAPEL} stroke={PAPEL} strokeWidth="9" strokeLinejoin="round">
        {silhueta}
      </g>
      {arte}
      <g clipPath={`url(#${id}c)`}>
        <g transform="rotate(20 60 60)">
          <rect className="ro-brilho" x="-30" y="-30" width="180" height="180" fill={`url(#${id}g)`} />
        </g>
      </g>
    </svg>
  )
}
