import { describe, expect, it } from "vitest"
import { diaMaisLimpo, fracaoDeNuvem } from "./nuvens"
import elementos from "@/data/elementos.json"
import { anosDoTimelapse, CAMADAS, dataCompleta, dataPadrao, urlDaImagem, urlDosBlocos } from "./gibs"
import { contarPorCategoria, eventosPerto, normalizarEonet } from "./eventos"
import { normalizarEpic, urlDaFotoEpic } from "./epic"
import { caixaAoRedor, destino, distanciaKm, poligonoDaFaixa } from "./geo"
import { criarSatrec, type ElementoOrbital, passagensSobre, passagensVisiveis, posicaoEm, rastroEntre } from "./orbitas"
import { SATELITES, satelitePorNorad } from "./satelites"
import { dataIsoLocal, horaLocal, solDoDia, somarDias } from "./sol"

const BRASILIA = { lat: -15.7939, lng: -47.8828 }
const RIO = { lat: -22.9068, lng: -43.1729 }
const elemento = (norad: number) => (elementos as ElementoOrbital[]).find((e) => e.NORAD_CAT_ID === norad) as ElementoOrbital
// perto da época dos elementos, onde o SGP4 é mais preciso
const EPOCA = Date.parse(`${elemento(25544).EPOCH}Z`)

describe("geo", () => {
  it("Brasília–Rio dá ~930 km em linha reta", () => {
    expect(distanciaKm(BRASILIA, RIO)).toBeGreaterThan(900)
    expect(distanciaKm(BRASILIA, RIO)).toBeLessThan(960)
  })
  it("andar 100 km e medir a volta dá 100 km", () => {
    expect(distanciaKm(BRASILIA, destino(BRASILIA, 37, 100))).toBeCloseTo(100, 3)
  })
  it("a faixa tem a largura pedida", () => {
    const rastro = [BRASILIA, destino(BRASILIA, 0, 50), destino(BRASILIA, 0, 100)]
    const poligono = poligonoDaFaixa(rastro, 290)
    expect(poligono).toHaveLength(6)
    expect(distanciaKm(poligono[0]!, poligono[5]!)).toBeCloseTo(290, 0)
  })
  it("a caixa cobre o raio nas duas direções", () => {
    const c = caixaAoRedor(BRASILIA, 111.32)
    expect(c.norte - c.sul).toBeCloseTo(2, 6)
  })
})

describe("órbitas", () => {
  it("todo satélite do catálogo tem elementos na cópia local", () => {
    for (const s of SATELITES) expect(elemento(s.norad), s.nome).toBeDefined()
  })

  it("a ISS voa a ~420 km e ~7,66 km/s", () => {
    const p = posicaoEm(criarSatrec(elemento(25544)), new Date(EPOCA))
    expect(p).not.toBeNull()
    expect(p!.altitudeKm).toBeGreaterThan(380)
    expect(p!.altitudeKm).toBeLessThan(450)
    expect(p!.velocidadeKmS).toBeCloseTo(7.66, 1)
  })

  it("Landsat 9 fica a ~705 km e nunca passa de 82° de latitude", () => {
    const satrec = criarSatrec(elemento(49260))
    const rastro = rastroEntre(satrec, EPOCA, EPOCA + 100 * 60_000, 60)
    const p = posicaoEm(satrec, new Date(EPOCA))!
    expect(p.altitudeKm).toBeGreaterThan(690)
    expect(p.altitudeKm).toBeLessThan(725)
    expect(Math.max(...rastro.map((x) => Math.abs(x.lat)))).toBeLessThan(83)
  })

  it("o Terra cobre Brasília pelo menos uma vez por dia, de manhã", () => {
    const sat = satelitePorNorad(25994)!
    const passagens = passagensSobre(criarSatrec(elemento(25994)), sat, BRASILIA, EPOCA, EPOCA + 86_400_000)
    const diurnas = passagens.filter((p) => p.dentroDaFaixa && p.deDia)
    expect(diurnas.length).toBeGreaterThanOrEqual(1)
    for (const p of diurnas) {
      const hora = Number(horaLocal(p.t, -180).slice(0, 2))
      expect(hora).toBeGreaterThanOrEqual(8)
      expect(hora).toBeLessThanOrEqual(13)
    }
  })

  it("dentro da faixa significa afastamento menor que meia faixa", () => {
    const sat = satelitePorNorad(40697)!
    const ps = passagensSobre(criarSatrec(elemento(40697)), sat, BRASILIA, EPOCA, EPOCA + 3 * 86_400_000)
    expect(ps.length).toBeGreaterThan(0)
    for (const p of ps) expect(p.dentroDaFaixa).toBe(p.afastamentoKm <= sat.faixaKm / 2)
  })

  it("passagens visíveis da ISS ficam acima de 10°", () => {
    const ps = passagensVisiveis(criarSatrec(elemento(25544)), BRASILIA, EPOCA, EPOCA + 2 * 86_400_000)
    for (const p of ps) {
      expect(p.elevacaoMax).toBeGreaterThanOrEqual(10)
      expect(p.fim).toBeGreaterThanOrEqual(p.inicio)
    }
  })
})

describe("GIBS", () => {
  it("monta o endereço dos blocos no padrão WMTS", () => {
    expect(urlDosBlocos("MODIS_Terra_CorrectedReflectance_TrueColor", CAMADAS["cor-terra"], "2026-11-21")).toBe(
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2026-11-21/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
    )
  })
  it("camada estática ignora a data e camada nova não volta antes de existir", () => {
    expect(urlDosBlocos("VIIRS_Black_Marble", CAMADAS.noite, "2026-01-01")).toContain("/2016-01-01/")
    expect(urlDosBlocos("x", CAMADAS["cor-noaa20"], "2010-01-01")).toContain("/2018-01-05/")
  })
  it("WMS 1.3.0 em 4326 leva latitude primeiro", () => {
    expect(urlDaImagem("L", "2020-01-01", { sul: -11, norte: -9, oeste: -64, leste: -61 })).toContain("BBOX=-11,-64,-9,-61")
  })
  it("time-lapse anda ano a ano no mesmo dia e termina na data pedida", () => {
    const anos = anosDoTimelapse("2026-08-15", "2000-02-24")
    expect(anos[0]).toBe("2001-08-15")
    expect(anos.at(-1)).toBe("2026-08-15")
    expect(anos).toHaveLength(26)
  })
  it("a data padrão é ontem", () => {
    expect(dataPadrao("2026-03-01")).toBe("2026-02-28")
  })
  it("o mosaico completo é anteontem de madrugada e ontem à tarde (UTC)", () => {
    expect(dataCompleta(new Date("2026-11-23T04:00:00Z"))).toBe("2026-11-21")
    expect(dataCompleta(new Date("2026-11-23T18:00:00Z"))).toBe("2026-11-22")
  })
})

describe("datas", () => {
  it("soma dias atravessando o ano", () => {
    expect(somarDias("2026-12-31", 1)).toBe("2027-01-01")
    expect(dataIsoLocal(Date.parse("2026-11-23T01:00:00Z"), -180)).toBe("2026-11-22")
  })
})

describe("EONET e EPIC", () => {
  const resposta = {
    events: [
      {
        id: "EONET_1",
        title: "Queimada perto de Brasília",
        categories: [{ id: "wildfires" }],
        sources: [{ id: "IRWIN", url: "https://exemplo" }],
        geometry: [{ date: "2026-11-20T00:00:00Z", type: "Point" as const, coordinates: [-47.9, -15.9] }],
      },
      {
        id: "EONET_2",
        title: "Tempestade no Atlântico",
        categories: [{ id: "severeStorms" }],
        sources: [],
        geometry: [
          { date: "2026-11-19T00:00:00Z", type: "Point" as const, coordinates: [-30, 10], magnitudeValue: 50, magnitudeUnit: "kts" },
          { date: "2026-11-20T00:00:00Z", type: "Point" as const, coordinates: [-31, 11], magnitudeValue: 65, magnitudeUnit: "kts" },
        ],
      },
    ],
  }
  it("usa a geometria mais recente e ordena por distância", () => {
    const eventos = normalizarEonet(resposta)
    expect(eventos[1]).toMatchObject({ lng: -31, lat: 11, magnitude: "65 kts" })
    const perto = eventosPerto(eventos, BRASILIA, 500)
    expect(perto).toHaveLength(1)
    expect(perto[0]!.distanciaKm).toBeLessThan(20)
    expect(contarPorCategoria(eventos)).toHaveLength(2)
  })
  it("monta o endereço da foto EPIC pela data", () => {
    const [f] = normalizarEpic([
      {
        identifier: "1",
        image: "epic_1b_20261120002712",
        date: "2026-11-20 00:22:24",
        centroid_coordinates: { lat: -16, lon: 161 },
        dscovr_j2000_position: { x: 1_000_000, y: 1_000_000, z: 0 },
      },
    ])
    expect(urlDaFotoEpic(f!)).toBe("https://epic.gsfc.nasa.gov/archive/natural/2026/11/20/jpg/epic_1b_20261120002712.jpg")
    expect(f!.distanciaKm).toBeCloseTo(1_414_213, -1)
  })
})

describe("terminador", () => {
  it("o ponto subsolar fica perto da longitude do meio-dia UTC", async () => {
    const { pontoSubsolar } = await import("./terminador")
    const s = pontoSubsolar(new Date("2026-03-20T12:00:00Z"))
    expect(Math.abs(s.lat)).toBeLessThan(1)
    expect(Math.abs(s.lng)).toBeLessThan(3)
  })
  it("no solstício de dezembro o polo sul está iluminado e a noite fecha pelo norte", async () => {
    const { poligonoDaNoite, pontoSubsolar } = await import("./terminador")
    const d = new Date("2026-12-21T12:00:00Z")
    expect(pontoSubsolar(d).lat).toBeCloseTo(-23.4, 0)
    const p = poligonoDaNoite(d)
    expect(p.at(-2)?.[1]).toBe(90)
    // à meia-noite (lng 180) o terminador fica bem ao sul: quase todo o meridiano está no escuro
    const meiaNoite = p.find(([lng]) => lng === 180)
    expect(meiaNoite?.[1]).toBeLessThan(-60)
  })
})

describe("nuvens e Sol", () => {
  const px = (...cores: number[][]) => cores.flatMap((c) => [...c, 255])
  it("conta o branco como nuvem e ignora o preto sem dado", () => {
    expect(fracaoDeNuvem(px([240, 240, 240], [40, 90, 30], [0, 0, 0], [30, 60, 120], [150, 152, 160]))).toBeCloseTo(2 / 4)
  })
  it("sem dado suficiente não estima", () => {
    expect(fracaoDeNuvem(px([0, 0, 0], [0, 0, 0], [0, 0, 0], [250, 250, 250]))).toBeNull()
  })
  it("escolhe o dia mais limpo", () => {
    expect(diaMaisLimpo([{ d: 1, nuvem: 0.6 }, { d: 2, nuvem: null }, { d: 3, nuvem: 0.1 }])?.d).toBe(3)
  })
  it("o dia em São Paulo no verão tem mais de 13 horas", () => {
    const s = solDoDia("2026-12-21", -23.55, -46.63)
    expect(s.duracaoMin).toBeGreaterThan(13 * 60)
    expect(s.nascer && s.por && s.nascer < s.por).toBe(true)
  })
})
