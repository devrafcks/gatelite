"use client"

import dynamic from "next/dynamic"

// O explorador vive no navegador: mapa WebGL, órbitas calculadas aqui e a URL como estado.
const Explorador = dynamic(() => import("./explorador").then((m) => m.Explorador), {
  ssr: false,
  loading: () => <TelaDeCarregamento />,
})

export function TelaDeCarregamento() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-[#05060a] text-sm text-white/60">
      <div className="flex flex-col items-center gap-4">
        <span className="gradiente-sol size-10 animate-pulso-sol rounded-full" />
        Apontando os satélites…
      </div>
    </div>
  )
}

export function CarregadorDoExplorador() {
  return <Explorador />
}
