"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import dynamic from "next/dynamic"
import { useState } from "react"

const Toaster = dynamic(() => import("@/components/ui/sonner").then((m) => m.Toaster), { ssr: false })

export function Provedores({ children }: { children: React.ReactNode }) {
  const [cliente] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }),
  )
  return (
    <QueryClientProvider client={cliente}>
      {children}
      <Toaster position="top-center" />
    </QueryClientProvider>
  )
}
