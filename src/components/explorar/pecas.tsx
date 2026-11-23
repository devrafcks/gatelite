"use client"

import { IconInfoCircle } from "@tabler/icons-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function Metrica({
  rotulo,
  valor,
  unidade,
  dica,
  destaque = false,
  className,
}: {
  rotulo: string
  valor: React.ReactNode
  unidade?: string
  dica?: string
  destaque?: boolean
  className?: string
}) {
  return (
    <div className={cn("min-w-0 border-t border-white/10 pt-3", className)}>
      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
        {rotulo}
        {dica && <Dica texto={dica} />}
      </dt>
      <dd className={cn("numero mt-1 truncate text-[1.3rem] leading-tight", destaque && "text-sol")}>
        {valor}
        {unidade && <span className="ml-1 font-sans text-sm text-muted-foreground">{unidade}</span>}
      </dd>
    </div>
  )
}

export function Dica({ texto }: { texto: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<button type="button" aria-label="Saiba mais" className="text-muted-foreground/70 hover:text-foreground" />}
      >
        <IconInfoCircle className="size-3.5" stroke={1.5} />
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-pretty">{texto}</TooltipContent>
    </Tooltip>
  )
}

export function Bloco({
  titulo,
  acao,
  children,
  className,
}: {
  titulo: string
  acao?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex min-h-8 items-center justify-between gap-3">
        <h3 className="text-sm font-medium">{titulo}</h3>
        {acao}
      </div>
      {children}
    </section>
  )
}

export function Pilula({ ativo, children, className, ...props }: React.ComponentProps<"button"> & { ativo?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3.5 text-sm transition-colors disabled:opacity-50",
        ativo ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Aviso({ tom = "neutro", children }: { tom?: "neutro" | "erro" | "sol"; children: React.ReactNode }) {
  return (
    <p
      role={tom === "erro" ? "alert" : undefined}
      className={cn(
        "rounded-2xl px-3.5 py-3 text-sm leading-relaxed",
        tom === "erro" && "bg-destructive/10 text-destructive",
        tom === "sol" && "bg-sol/10 text-foreground",
        tom === "neutro" && "bg-muted/70 text-muted-foreground",
      )}
    >
      {children}
    </p>
  )
}

export function Segmentos<T extends string>({
  opcoes,
  valor,
  aoMudar,
  rotulo,
}: {
  opcoes: readonly { id: T; rotulo: string }[]
  valor: T
  aoMudar: (v: T) => void
  rotulo: string
}) {
  return (
    <div className="grid gap-1 rounded-xl bg-muted p-1" style={{ gridTemplateColumns: `repeat(${opcoes.length}, 1fr)` }} role="radiogroup" aria-label={rotulo}>
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={valor === o.id}
          onClick={() => aoMudar(o.id)}
          className={cn(
            "h-9 rounded-lg text-sm font-medium text-muted-foreground transition-colors",
            valor === o.id && "bg-card text-foreground shadow-suave",
          )}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  )
}
