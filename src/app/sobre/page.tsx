import { IconExternalLink } from "@tabler/icons-react"
import type { Metadata } from "next"
import { Cabecalho } from "@/components/site/navegacao"
import { Rodape } from "@/components/site/rodape"

export const metadata: Metadata = {
  alternates: { canonical: "/sobre" },
  openGraph: { url: "/sobre" },
  title: "Sobre e fontes",
  description: "De onde vêm as imagens, as órbitas e os eventos do Gatélite, como as passagens são calculadas e o que é guardado.",
}

const FONTES = [
  { nome: "NASA GIBS / Worldview", uso: "Imagens diárias do planeta desde 2000, camadas científicas e o time-lapse.", url: "https://nasa-gibs.github.io/gibs-api-docs/" },
  { nome: "NASA HLS", uso: "Cenas de 30 m dos Landsat 8/9 e Sentinel-2, harmonizadas.", url: "https://hls.gsfc.nasa.gov/" },
  { nome: "NASA EPIC (DSCOVR)", uso: "As fotos do planeta inteiro, a 1,5 milhão de km.", url: "https://epic.gsfc.nasa.gov/" },
  { nome: "NASA EONET", uso: "Eventos naturais ativos: queimadas, tempestades, vulcões, gelo.", url: "https://eonet.gsfc.nasa.gov/" },
  { nome: "NASA APOD", uso: "A foto astronômica do dia.", url: "https://apod.nasa.gov/" },
  { nome: "CelesTrak", uso: "Elementos orbitais (OMM) atualizados dos satélites.", url: "https://celestrak.org/" },
  { nome: "Photon e Open-Meteo", uso: "Busca de lugares, com dados do OpenStreetMap.", url: "https://photon.komoot.io/" },
  { nome: "Natural Earth", uso: "O contorno dos continentes do globo pontilhado.", url: "https://www.naturalearthdata.com/" },
]

export default function PaginaSobre() {
  return (
    <div className="bg-background text-foreground">
      <Cabecalho />
      <main className="mx-auto max-w-3xl px-4 pt-8 pb-12 md:px-6">
        <h1 className="titulo-display text-[clamp(2.6rem,6vw,4.6rem)] font-light">
          Sobre o <span className="font-semibold">Gatélite.</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Os dados de observação da Terra são públicos, mas espalhados por portais técnicos. O Gatélite junta tudo num lugar
          só, em português, e liga duas coisas que quase ninguém liga: o satélite que passou e a foto que ele tirou.
        </p>

        <section className="mt-16" id="como">
          <h2 className="titulo-display text-3xl font-light">Como as passagens são calculadas</h2>
          <div className="mt-5 space-y-4 leading-relaxed text-muted-foreground">
            <p>
              A cada poucas horas o servidor busca na CelesTrak os elementos orbitais de cada satélite. O seu navegador
              propaga essas órbitas com o modelo SGP4 e acompanha o ponto do chão bem embaixo de cada um, o nadir.
            </p>
            <p>
              Uma passagem conta como cobertura quando o seu lugar fica dentro da faixa que o sensor varre: 185 km no
              Landsat, 290 km no Sentinel-2, 2.330 km no MODIS dos satélites Terra e Aqua. Para ter foto em cor, ainda
              precisa ter luz do Sol.
            </p>
          </div>
        </section>

        <section className="mt-16" id="fontes">
          <h2 className="titulo-display text-3xl font-light">Fontes dos dados</h2>
          <ul className="mt-6 divide-y rounded-2xl border bg-card">
            {FONTES.map((f) => (
              <li key={f.nome}>
                <a href={f.url} target="_blank" rel="noreferrer" className="group flex items-start justify-between gap-4 px-5 py-4 hover:bg-muted/60">
                  <span>
                    <span className="block font-medium">{f.nome}</span>
                    <span className="block text-sm text-muted-foreground">{f.uso}</span>
                  </span>
                  <IconExternalLink className="mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-foreground" stroke={1.5} />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            O Gatélite é um projeto independente e não tem ligação oficial com a NASA ou com as agências citadas.
          </p>
        </section>

        <section className="mt-16" id="privacidade">
          <h2 className="titulo-display text-3xl font-light">Privacidade</h2>
          <div className="mt-5 space-y-4 leading-relaxed text-muted-foreground">
            <p>Não há conta, cadastro nem banco de dados. Os lugares salvos ficam só no seu navegador.</p>
            <p>
              A localização só é pedida quando você toca em “minha localização”, e as coordenadas são arredondadas antes de
              qualquer consulta. Não usamos cookies de rastreamento.
            </p>
          </div>
        </section>
      </main>
      <Rodape />
    </div>
  )
}
