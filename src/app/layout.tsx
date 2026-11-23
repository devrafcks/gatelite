import type { Metadata, Viewport } from "next"
import { Anybody, Geist, Geist_Mono } from "next/font/google"
import { Abertura, SCRIPT_ABERTURA } from "@/components/site/abertura"
import { NavegacaoMovel } from "@/components/site/navegacao"
import { Provedores } from "@/components/provedores"
import { MARCA } from "@/lib/marca"
import "./globals.css"
import "@/styles/rodape-orbital.css"
import "@/styles/hero-orbital.css"

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
// a mesma família larga do logotipo, usada nas chamadas grandes
const display = Anybody({ variable: "--font-display-face", subsets: ["latin"], axes: ["wdth"] })

export const metadata: Metadata = {
  metadataBase: new URL(MARCA.url),
  title: { default: `${MARCA.nome} · ${MARCA.slogan}`, template: `%s · ${MARCA.nome}` },
  description: MARCA.descricao,
  applicationName: MARCA.nome,
  keywords: [
    "imagem de satélite",
    "imagem de satélite de hoje",
    "satélites ao vivo",
    "NASA",
    "Landsat",
    "Sentinel-2",
    "MODIS",
    "VIIRS",
    "Amazonia-1",
    "CBERS",
    "queimadas",
    "desmatamento",
    "time-lapse",
    "foto da Terra",
    "EPIC",
  ],
  authors: [{ name: "devrafcks", url: "https://github.com/devrafcks" }],
  creator: "devrafcks",
  category: "education",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "pt_BR", siteName: MARCA.nome, url: "/" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: false },
}

const DADOS_ESTRUTURADOS = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: MARCA.nome,
      url: MARCA.url,
      inLanguage: "pt-BR",
      description: MARCA.descricao,
    },
    {
      "@type": "WebApplication",
      name: MARCA.nome,
      url: MARCA.url,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      inLanguage: "pt-BR",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
      description: MARCA.descricao,
      creator: { "@type": "Person", name: "devrafcks", url: "https://github.com/devrafcks" },
    },
  ],
}

export const viewport: Viewport = {
  themeColor: "#08090d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} ${display.variable} dark h-full antialiased`}
    >
      <body className="min-h-full">
        {/* antes de qualquer pintura: quem já viu a abertura não vê de novo */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: script estático de uma linha */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_ABERTURA }} />
        {/* dados estruturados: o Google entende que é um aplicativo web gratuito, em português */}
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD estático, gerado aqui
          dangerouslySetInnerHTML={{ __html: JSON.stringify(DADOS_ESTRUTURADOS) }}
        />
        <Provedores>
          <Abertura />
          {children}
          <NavegacaoMovel />
        </Provedores>
      </body>
    </html>
  )
}
