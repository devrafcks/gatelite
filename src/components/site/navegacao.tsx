"use client"

import {
  IconArrowUpRight,
  IconBookmark,
  IconHome2,
  IconMap2,
  IconSatellite,
  IconWorld,
} from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const LINKS = [
  { href: "/", rotulo: "Início", icone: IconHome2 },
  { href: "/explorar", rotulo: "Explorar", icone: IconMap2 },
  { href: "/planeta", rotulo: "Planeta", icone: IconWorld },
  { href: "/satelites", rotulo: "Satélites", icone: IconSatellite },
  { href: "/lugares", rotulo: "Lugares", icone: IconBookmark },
] as const

const ativo = (atual: string, href: string) => (href === "/" ? atual === "/" : atual.startsWith(href))

export function Cabecalho({ sobreposto = false }: { sobreposto?: boolean }) {
  const caminho = usePathname()
  return (
    <header
      className={cn(
        "nao-imprimir z-40 flex items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4",
        sobreposto ? "pointer-events-none absolute inset-x-0 top-0 [&>*]:pointer-events-auto" : "relative",
      )}
    >
      <Link
        href="/"
        className="vidro flex h-11 items-center rounded-xl pr-4 pl-2.5 text-foreground shadow-suave transition-colors hover:bg-card"
        aria-label="Gatélite, página inicial"
      >
        <Logo />
      </Link>

      <nav aria-label="Principal" className="vidro hidden items-center gap-1 rounded-xl p-1 shadow-suave lg:flex">
        {LINKS.filter((l) => l.href !== "/").map(({ href, rotulo, icone: Icone }) => (
          <Link
            key={href}
            href={href}
            aria-current={ativo(caminho, href) ? "page" : undefined}
            className={cn(
              "flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              ativo(caminho, href) && "bg-primary text-primary-foreground hover:text-primary-foreground",
            )}
          >
            <Icone className="size-[17px]" stroke={1.5} />
            {rotulo}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {!caminho.startsWith("/explorar") && (
          <Button render={<Link href="/explorar" />} nativeButton={false} className="hidden h-11 pr-2 pl-5 sm:inline-flex">
            Ver o meu lugar
            <span className="grid size-7 place-items-center rounded-lg bg-sol text-white">
              <IconArrowUpRight className="size-4" stroke={2} />
            </span>
          </Button>
        )}
      </div>
    </header>
  )
}

// No celular, a navegação desce para uma barra preta com o item ativo em pílula branca.
export function NavegacaoMovel() {
  const caminho = usePathname()
  if (caminho.startsWith("/explorar")) return null
  return (
    <nav
      aria-label="Principal"
      className="nao-imprimir fixed inset-x-3 bottom-3 z-50 flex items-center justify-between rounded-2xl border border-white/10 bg-[#14161e]/90 p-1.5 shadow-flutuante backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
    >
      {LINKS.map(({ href, rotulo, icone: Icone }) => {
        const esta = ativo(caminho, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={esta ? "page" : undefined}
            aria-label={rotulo}
            className={cn(
              "flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-white/60 transition-all",
              esta && "bg-white px-4 text-tinta",
            )}
          >
            <Icone className="size-5" stroke={1.5} />
            {esta && <span>{rotulo}</span>}
          </Link>
        )
      })}
    </nav>
  )
}
