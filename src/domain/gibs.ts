import { somarDias } from "./tempo"

export type IdCamada =
  | "cor-terra"
  | "cor-aqua"
  | "cor-noaa20"
  | "cor-noaa21"
  | "hls"
  | "infravermelho"
  | "noite"
  | "temperatura"
  | "aerossois"
  | "detalhe"

export type Camada = {
  readonly id: IdCamada
  readonly nome: string
  readonly descricao: string
  readonly fonte: string
  readonly gibs: readonly string[]
  readonly formato: "jpg" | "png"
  readonly nivelMaximo: number
  readonly desde: string
  readonly dataFixa?: string
  readonly fundo?: IdCamada
  readonly blocos?: { readonly url: string; readonly atribuicao: string }
  readonly grupo: "cor" | "detalhe" | "ciencia"
}

export const CAMADAS: Record<IdCamada, Camada> = {
  "cor-terra": {
    id: "cor-terra",
    nome: "Cor real · manhã",
    descricao: "MODIS no satélite Terra, por volta das 10h30. A foto do dia mais completa desde 2000.",
    fonte: "NASA Terra / MODIS",
    gibs: ["MODIS_Terra_CorrectedReflectance_TrueColor"],
    formato: "jpg",
    nivelMaximo: 9,
    desde: "2000-02-24",
    grupo: "cor",
  },
  "cor-aqua": {
    id: "cor-aqua",
    nome: "Cor real · tarde",
    descricao: "MODIS no satélite Aqua, por volta das 13h30. Bom para comparar nuvens com a manhã.",
    fonte: "NASA Aqua / MODIS",
    gibs: ["MODIS_Aqua_CorrectedReflectance_TrueColor"],
    formato: "jpg",
    nivelMaximo: 9,
    desde: "2002-07-04",
    grupo: "cor",
  },
  "cor-noaa20": {
    id: "cor-noaa20",
    nome: "Cor real · VIIRS",
    descricao: "VIIRS no NOAA-20, faixa de 3 mil km: quase sem buracos entre as passagens.",
    fonte: "NOAA-20 / VIIRS",
    gibs: ["VIIRS_NOAA20_CorrectedReflectance_TrueColor"],
    formato: "jpg",
    nivelMaximo: 9,
    desde: "2018-01-05",
    grupo: "cor",
  },
  "cor-noaa21": {
    id: "cor-noaa21",
    nome: "Cor real · NOAA-21",
    descricao: "O VIIRS mais novo, meia órbita à frente do NOAA-20.",
    fonte: "NOAA-21 / VIIRS",
    gibs: ["VIIRS_NOAA21_CorrectedReflectance_TrueColor"],
    formato: "jpg",
    nivelMaximo: 9,
    desde: "2023-02-10",
    grupo: "cor",
  },
  hls: {
    id: "hls",
    nome: "Landsat + Sentinel · 30 m",
    descricao: "Cenas harmonizadas dos Landsat 8/9 e Sentinel-2. Só aparece onde houve passagem naquele dia.",
    fonte: "NASA HLS (Landsat + Sentinel-2)",
    gibs: ["HLS_S30_Nadir_BRDF_Adjusted_Reflectance", "HLS_L30_Nadir_BRDF_Adjusted_Reflectance"],
    formato: "png",
    nivelMaximo: 12,
    desde: "2015-11-28",
    fundo: "cor-terra",
    grupo: "detalhe",
  },
  infravermelho: {
    id: "infravermelho",
    nome: "Infravermelho 7-2-1",
    descricao: "Queimadas recentes em vermelho-escuro, vegetação em verde vivo, água em preto e azul.",
    fonte: "NASA Terra / MODIS",
    gibs: ["MODIS_Terra_CorrectedReflectance_Bands721"],
    formato: "jpg",
    nivelMaximo: 9,
    desde: "2000-02-24",
    grupo: "ciencia",
  },
  noite: {
    id: "noite",
    nome: "Luzes da noite",
    descricao: "Mosaico Black Marble: as cidades vistas à noite pelo VIIRS, sem nuvens.",
    fonte: "NASA Black Marble / VIIRS",
    gibs: ["VIIRS_Black_Marble"],
    formato: "png",
    nivelMaximo: 8,
    desde: "2016-01-01",
    dataFixa: "2016-01-01",
    grupo: "ciencia",
  },
  temperatura: {
    id: "temperatura",
    nome: "Temperatura do solo",
    descricao: "Temperatura da superfície de dia. Onde há nuvem, não há medida.",
    fonte: "NASA Terra / MODIS",
    gibs: ["MODIS_Terra_Land_Surface_Temp_Day"],
    formato: "png",
    nivelMaximo: 7,
    desde: "2000-02-24",
    fundo: "cor-terra",
    grupo: "ciencia",
  },
  detalhe: {
    id: "detalhe",
    nome: "Satélite detalhado",
    descricao: "Mosaico de alta resolução: dá para ver ruas, casas e quadras. Não é a foto de hoje, é a mais nítida dos últimos meses.",
    fonte: "Esri World Imagery (Maxar, Earthstar Geographics)",
    gibs: [],
    formato: "jpg",
    nivelMaximo: 19,
    desde: "2000-01-01",
    dataFixa: "mosaico",
    blocos: {
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      atribuicao: "Imagens: Esri, Maxar, Earthstar Geographics",
    },
    grupo: "detalhe",
  },
  aerossois: {
    id: "aerossois",
    nome: "Fumaça e poeira",
    descricao: "Profundidade óptica de aerossóis: fumaça de queimadas, poeira e poluição no ar.",
    fonte: "NASA Terra / MODIS",
    gibs: ["MODIS_Terra_Aerosol"],
    formato: "png",
    nivelMaximo: 6,
    desde: "2000-02-24",
    fundo: "cor-terra",
    grupo: "ciencia",
  },
}

export const ID_CAMADAS = Object.keys(CAMADAS) as IdCamada[]
export const ehCamada = (v: unknown): v is IdCamada => typeof v === "string" && v in CAMADAS

const BASE = "https://gibs.earthdata.nasa.gov"

export const dataDaCamada = (c: Camada, data: string) => c.dataFixa ?? (data < c.desde ? c.desde : data)

export const urlDosBlocos = (gibsId: string, c: Camada, data: string) =>
  `${BASE}/wmts/epsg3857/best/${gibsId}/default/${dataDaCamada(c, data)}/GoogleMapsCompatible_Level${c.nivelMaximo}/{z}/{y}/{x}.${c.formato}`

export type Caixa = { sul: number; norte: number; oeste: number; leste: number }

export const urlWms = (gibsId: string, data: string, caixa: Caixa, largura = 720, altura = 480, formato: "jpg" | "png" = "jpg") =>
  `${BASE}/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=${gibsId}&CRS=EPSG:4326&BBOX=${caixa.sul},${caixa.oeste},${caixa.norte},${caixa.leste}&WIDTH=${largura}&HEIGHT=${altura}&FORMAT=image/${formato === "jpg" ? "jpeg" : "png"}${formato === "png" ? "&TRANSPARENT=TRUE" : ""}&TIME=${data}`

const arred = (v: number) => Number(v.toFixed(4))

export const urlDaImagem = (gibsId: string, data: string, caixa: Caixa, largura = 720, altura = 480, formato: "jpg" | "png" = "jpg") =>
  `/api/gibs?camada=${gibsId}&data=${data}&caixa=${arred(caixa.sul)},${arred(caixa.oeste)},${arred(caixa.norte)},${arred(caixa.leste)}&l=${Math.round(largura)}&a=${Math.round(altura)}&f=${formato}`

type Matriz = { readonly nome: string; readonly niveis: number; readonly ext: "jpg" | "png" }
const M250: Matriz = { nome: "250m", niveis: 9, ext: "jpg" }
export const MATRIZES: Record<string, Matriz> = {
  MODIS_Terra_CorrectedReflectance_TrueColor: M250,
  MODIS_Aqua_CorrectedReflectance_TrueColor: M250,
  VIIRS_NOAA20_CorrectedReflectance_TrueColor: M250,
  VIIRS_NOAA21_CorrectedReflectance_TrueColor: M250,
  VIIRS_SNPP_CorrectedReflectance_TrueColor: M250,
  MODIS_Terra_CorrectedReflectance_Bands721: M250,
  BlueMarble_NextGeneration: { nome: "500m", niveis: 8, ext: "jpg" },
  VIIRS_Black_Marble: { nome: "500m", niveis: 8, ext: "png" },
  MODIS_Terra_Land_Surface_Temp_Day: { nome: "1km", niveis: 7, ext: "png" },
  MODIS_Terra_Aerosol: { nome: "2km", niveis: 6, ext: "png" },
  HLS_S30_Nadir_BRDF_Adjusted_Reflectance: { nome: "31.25m", niveis: 12, ext: "png" },
  HLS_L30_Nadir_BRDF_Adjusted_Reflectance: { nome: "31.25m", niveis: 12, ext: "png" },
}

export const urlDoBloco4326 = (gibsId: string, data: string, nivel: number, linha: number, coluna: number) => {
  const m = MATRIZES[gibsId]
  if (!m) throw new Error(`camada desconhecida: ${gibsId}`)
  return `${BASE}/wmts/epsg4326/best/${gibsId}/default/${data}/${m.nome}/${nivel}/${linha}/${coluna}.${m.ext}`
}

export const blocosDaCaixa = (gibsId: string, caixa: Caixa, largura: number) => {
  const m = MATRIZES[gibsId]
  if (!m) throw new Error(`camada desconhecida: ${gibsId}`)
  const grausPorPixelPedido = (caixa.leste - caixa.oeste) / largura
  let nivel = 0
  while (nivel < m.niveis - 1 && 0.5625 / 2 ** nivel > grausPorPixelPedido) nivel++
  const graus = 288 / 2 ** nivel
  const colunas = Math.ceil(360 / graus)
  const linhas = Math.ceil(180 / graus)
  const c0 = Math.max(0, Math.floor((caixa.oeste + 180) / graus))
  const c1 = Math.min(colunas - 1, Math.floor((caixa.leste + 180 - 1e-9) / graus))
  const l0 = Math.max(0, Math.floor((90 - caixa.norte) / graus))
  const l1 = Math.min(linhas - 1, Math.floor((90 - caixa.sul - 1e-9) / graus))
  const grausPorPixel = graus / 512
  return {
    nivel,
    c0,
    c1,
    l0,
    l1,
    recorte: {
      esquerda: Math.round((caixa.oeste + 180 - c0 * graus) / grausPorPixel),
      topo: Math.round((90 - caixa.norte - l0 * graus) / grausPorPixel),
      largura: Math.max(1, Math.round((caixa.leste - caixa.oeste) / grausPorPixel)),
      altura: Math.max(1, Math.round((caixa.norte - caixa.sul) / grausPorPixel)),
    },
  }
}

export const dataPadrao = (hojeUtc: string) => somarDias(hojeUtc, -1)

export const dataCompleta = (agora: Date) => {
  const hoje = agora.toISOString().slice(0, 10)
  return somarDias(hoje, agora.getUTCHours() < 15 ? -2 : -1)
}

export const anosDoTimelapse = (dataBase: string, desde: string, passo = 1) => {
  const [a, m, d] = dataBase.split("-")
  const anoFinal = Number(a)
  const anoInicial = Math.max(Number(desde.slice(0, 4)) + 1, 2001)
  const datas: string[] = []
  for (let ano = anoInicial; ano <= anoFinal; ano += passo) datas.push(`${ano}-${m}-${d}`)
  if (datas[datas.length - 1] !== dataBase) datas.push(dataBase)
  return datas
}

export const urlDoMosaicoDetalhado = (caixa: Caixa, largura = 480, altura = 360) =>
  `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${caixa.oeste},${caixa.sul},${caixa.leste},${caixa.norte}&bboxSR=4326&imageSR=3857&size=${largura},${altura}&format=jpg&f=image`
