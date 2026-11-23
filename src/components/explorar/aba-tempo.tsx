"use client"

import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react"
import { useEffect, useMemo, useState } from "react"
import { Cortina } from "@/components/terra/cortina"
import { Slider } from "@/components/ui/slider"
import { caixaAoRedor, type LatLng } from "@/domain/geo"
import { anosDoTimelapse, CAMADAS, type IdCamada, urlDaImagem } from "@/domain/gibs"
import { dataLonga } from "@/lib/formato"
import { DiasLimpos } from "./dias-limpos"
import { Aviso, Bloco, Segmentos } from "./pecas"

type Modo = "timelapse" | "comparar"

// raio da janela da imagem a partir do zoom do mapa: aproximar mostra menos chão
const raioPeloZoom = (z: number) => Math.max(25, Math.min(900, 40_000 / 2 ** z))

export function AbaTempo({
  lugar,
  zoom,
  data,
  ultimo,
  camada,
  aoEscolherDia,
}: {
  lugar: LatLng
  zoom: number
  data: string
  ultimo: string
  camada: IdCamada
  aoEscolherDia: (dia: string) => void
}) {
  const [modo, setModo] = useState<Modo>("timelapse")
  // camadas esparsas ou fixas não servem para time-lapse: usa a cor real do Terra
  const base = CAMADAS[camada].dataFixa || camada === "hls" ? CAMADAS["cor-terra"] : CAMADAS[camada]
  const gibsId = base.gibs[0] as string
  const anos = useMemo(() => anosDoTimelapse(data, base.desde), [data, base.desde])
  const caixa = useMemo(() => caixaAoRedor(lugar, raioPeloZoom(zoom)), [lugar, zoom])
  const urls = useMemo(() => anos.map((d) => urlDaImagem(gibsId, d, caixa, 720, 480)), [anos, gibsId, caixa])

  const [quadro, setQuadro] = useState(anos.length - 1)
  const [tocando, setTocando] = useState(false)
  const [carregadas, setCarregadas] = useState<Set<number>>(() => new Set())
  const [antes, setAntes] = useState(0)
  const [depois, setDepois] = useState(anos.length - 1)

  useEffect(() => {
    setQuadro(anos.length - 1)
    setDepois(anos.length - 1)
    setAntes(0)
    setCarregadas(new Set())
  }, [anos.length])

  // pré-carrega os anos em ordem, sem disparar tudo de uma vez
  useEffect(() => {
    let cancelado = false
    setCarregadas(new Set())
    ;(async () => {
      for (let i = urls.length - 1; i >= 0; i--) {
        if (cancelado) return
        await new Promise<void>((ok) => {
          const img = new Image()
          img.onload = img.onerror = () => {
            if (!cancelado) setCarregadas((s) => new Set(s).add(i))
            ok()
          }
          img.src = urls[i] as string
        })
      }
    })()
    return () => {
      cancelado = true
    }
  }, [urls])

  useEffect(() => {
    if (!tocando) return
    const id = setInterval(() => setQuadro((q) => (q + 1) % anos.length), 650)
    return () => clearInterval(id)
  }, [tocando, anos.length])

  const ano = (i: number) => (anos[i] ?? "").slice(0, 4)

  return (
    <div className="space-y-6">
      <DiasLimpos lugar={lugar} ultimo={ultimo} data={data} aoEscolher={aoEscolherDia} />
      <Segmentos
        rotulo="Modo"
        valor={modo}
        aoMudar={setModo}
        opcoes={[
          { id: "timelapse", rotulo: "Time-lapse" },
          { id: "comparar", rotulo: "Antes e depois" },
        ]}
      />

      {modo === "timelapse" ? (
        <Bloco titulo={`${dataLonga(data).replace(/ de \d{4}$/, "")}, ano a ano`}>
          <div className="relative overflow-hidden rounded-2xl bg-noite" style={{ aspectRatio: "3 / 2" }}>
            {urls.map((u, i) =>
              Math.abs(i - quadro) <= 1 || i === quadro ? (
                // biome-ignore lint/performance/noImgElement: imagens externas do GIBS
                <img
                  key={u}
                  src={u}
                  alt={i === quadro ? `O lugar em ${anos[i]}` : ""}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ opacity: i === quadro ? 1 : 0 }}
                />
              ) : null,
            )}
            <span className="numero absolute top-3 left-3 rounded-lg bg-black/55 px-3 py-1 text-sm text-white backdrop-blur">
              {ano(quadro)}
            </span>
            <span className="absolute right-3 bottom-3 rounded-lg bg-black/55 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur">
              {carregadas.size}/{urls.length} anos
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTocando((v) => !v)}
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground active:scale-95"
              aria-label={tocando ? "Pausar" : "Tocar o time-lapse"}
            >
              {tocando ? <IconPlayerPauseFilled className="size-4" /> : <IconPlayerPlayFilled className="size-4" />}
            </button>
            <Slider
              aria-label="Ano"
              min={0}
              max={anos.length - 1}
              step={1}
              value={[quadro]}
              onValueChange={(v) => {
                setTocando(false)
                setQuadro(Array.isArray(v) ? (v[0] as number) : (v as number))
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{ano(0)}</span>
            <span>{ano(anos.length - 1)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {base.nome} ({base.fonte}). Dias com nuvem aparecem brancos.
          </p>
        </Bloco>
      ) : (
        <Bloco titulo="Arraste a cortina">
          <Cortina antes={urls[antes] ?? ""} depois={urls[depois] ?? ""} rotuloAntes={ano(antes)} rotuloDepois={ano(depois)} />
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["Antes", antes, setAntes],
                ["Depois", depois, setDepois],
              ] as const
            ).map(([r, v, set]) => (
              <label key={r} className="space-y-1 text-xs text-muted-foreground">
                {r}
                <select
                  value={v}
                  onChange={(e) => set(Number(e.target.value))}
                  className="h-10 w-full cursor-pointer rounded-xl border bg-card px-3 text-sm text-foreground outline-none [color-scheme:dark]"
                >
                  {anos.map((d, i) => (
                    <option key={d} value={i}>
                      {d.slice(0, 4)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </Bloco>
      )}

      {camada !== base.id && (
        <Aviso>A camada escolhida não tem imagem para todo ano. A linha do tempo usa a cor real do satélite Terra.</Aviso>
      )}
    </div>
  )
}
