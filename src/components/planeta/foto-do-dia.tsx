"use client"

import { IconExternalLink } from "@tabler/icons-react"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useApod } from "@/lib/consultas"

export function FotoDoDia() {
  const apod = useApod()
  const [inteiro, setInteiro] = useState(false)

  if (apod.isPending) return <Skeleton className="h-[28rem] w-full rounded-2xl" />
  if (apod.isError || !apod.data)
    return (
      <div className="cartao p-6 text-sm text-muted-foreground">
        A foto do dia da NASA não respondeu agora. O limite de consultas pode ter sido atingido; volte mais tarde.
      </div>
    )
  const a = apod.data
  return (
    <article className="cartao overflow-hidden">
      {a.tipo === "image" ? (
        <img src={a.url} alt={a.titulo} className="aspect-[4/3] w-full object-cover" loading="lazy" decoding="async" />
      ) : a.tipo === "video" ? (
        <iframe src={a.url} title={a.titulo} className="aspect-video w-full" allow="encrypted-media" loading="lazy" />
      ) : null}
      <div className="space-y-3 p-6">
        <p className="numero text-xs text-muted-foreground">{a.data.split("-").reverse().join("/")}</p>
        <h3 className="titulo-display text-2xl font-medium">{a.titulo}</h3>
        <p lang="en" className={inteiro ? "text-sm leading-relaxed text-muted-foreground" : "line-clamp-4 text-sm leading-relaxed text-muted-foreground"}>
          {a.explicacao}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <button type="button" className="font-medium hover:underline" onClick={() => setInteiro((v) => !v)}>
            {inteiro ? "Mostrar menos" : "Ler tudo (em inglês)"}
          </button>
          <a
            href={`https://apod.nasa.gov/apod/ap${a.data.slice(2).replaceAll("-", "")}.html`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            Ver na NASA <IconExternalLink className="size-4" stroke={1.5} />
          </a>
        </div>
        {a.credito && <p className="text-xs text-muted-foreground">Crédito: {a.credito}</p>}
      </div>
    </article>
  )
}
