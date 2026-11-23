"use client"

import { useState } from "react"
import { GiroDaTerra } from "@/components/terra/giro-da-terra"
import { Skeleton } from "@/components/ui/skeleton"
import { useDatasEpic, useEpic } from "@/lib/consultas"
import { dataCurta } from "@/lib/formato"
import { cn } from "@/lib/utils"

// As fotos do planeta inteiro, dia a dia. A EPIC publica com 1 a 3 dias de atraso.
export function VisorEpic() {
  const datas = useDatasEpic()
  const [escolhida, setEscolhida] = useState<string | undefined>(undefined)
  const fotos = useEpic(escolhida)
  const ultimas = (datas.data ?? []).slice(-12).reverse()
  const dataAtual = escolhida ?? fotos.data?.[0]?.data.slice(0, 10)

  return (
    <div>
      <div className="mx-auto w-full max-w-[34rem]">
        {fotos.isPending && <Skeleton className="aspect-square w-full rounded-full" />}
        {fotos.isError && (
          <div className="grid aspect-square place-items-center rounded-full border border-white/10 p-10 text-center text-sm text-muted-foreground">
            A câmera EPIC não respondeu. Tente outro dia ou volte em alguns minutos.
          </div>
        )}
        {fotos.data && fotos.data.length > 0 && <GiroDaTerra key={dataAtual} fotos={fotos.data} />}
        {fotos.data?.length === 0 && (
          <p className="py-20 text-center text-sm text-muted-foreground">Sem fotos nesse dia.</p>
        )}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {ultimas.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setEscolhida(d)}
            aria-pressed={dataAtual === d}
            className={cn(
              "h-9 shrink-0 rounded-lg border px-3 text-sm capitalize transition-colors",
              dataAtual === d ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
            )}
          >
            {dataCurta(d)}
          </button>
        ))}
      </div>
    </div>
  )
}
