"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useFrota } from "@/lib/consultas"

const GloboPontilhado = dynamic(() => import("@/components/terra/globo-pontilhado").then((m) => m.GloboPontilhado), {
  ssr: false,
  loading: () => <div className="aspect-square w-full animate-pulse rounded-full bg-white/[0.03]" />,
})

export function GloboDaLanding() {
  const { frota } = useFrota()
  const router = useRouter()
  return <GloboPontilhado frota={frota} destaque={49260} aoEscolher={() => router.push("/satelites")} />
}
