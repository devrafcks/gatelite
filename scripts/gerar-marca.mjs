import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import opentype from "opentype.js"

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..")
const saida = (p, conteudo) => {
  const destino = join(raiz, p)
  mkdirSync(dirname(destino), { recursive: true })
  writeFileSync(destino, conteudo)
  console.log("✓", p)
}

export const TINTA = "#0E0E12"
export const BRANCO = "#FFFFFF"
export const AMBAR = "#FFB547"
export const LARANJA = "#FF5A1F"

export const SIMBOLO = {
  planeta: { cx: 60, cy: 87, r: 30 },
  faixas: [59, 67.5, 76, 84.5, 93, 101.5, 110],
  faixaAltura: 5.2,
  corpo: "M45 58C44 43 49 32 60 32C71 32 76 43 75 58Z",
  cabeca: { cx: 60, cy: 24, r: 10.5 },
  orelhas: ["M50.5 20L51.5 5.5L59 14Z", "M69.5 20L68.5 5.5L61 14Z"],
  listras: "M53 41C52 46 52 51 53 56M60 38V57M67 41C68 46 68 51 67 56",
  rabo: "M74 55C86 57 94 49 92 40C90.5 34 84 34 84.5 39.5",
  raboPonta: { cx: 88.2, cy: 39.8, r: 1.8 },
  estrela: "M24 6C25 13 27 15 34 16C27 17 25 19 24 26C23 19 21 17 14 16C21 15 23 13 24 6Z",
}

const simbolo = (cor, id, dx = 0, dy = 0, escala = 1) => {
  const S = SIMBOLO
  const faixas = S.faixas.map((y) => `<rect x="20" y="${y}" width="80" height="${S.faixaAltura}" rx="${S.faixaAltura / 2}"/>`).join("")
  return `<defs><clipPath id="${id}p"><circle cx="${S.planeta.cx}" cy="${S.planeta.cy}" r="${S.planeta.r}"/></clipPath><mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120"><rect width="120" height="120" fill="#fff"/><path d="${S.listras}" stroke="#000" stroke-width="2.6" stroke-linecap="round" fill="none"/></mask></defs><g transform="translate(${dx} ${dy}) scale(${escala})"><g clip-path="url(#${id}p)" fill="${cor}">${faixas}</g><g fill="${cor}" mask="url(#${id}m)"><path d="${S.corpo}"/><circle cx="${S.cabeca.cx}" cy="${S.cabeca.cy}" r="${S.cabeca.r}"/>${S.orelhas.map((o) => `<path d="${o}"/>`).join("")}</g><path d="${S.rabo}" fill="none" stroke="${cor}" stroke-width="5.2" stroke-linecap="round"/><circle cx="${S.raboPonta.cx}" cy="${S.raboPonta.cy}" r="${S.raboPonta.r}" fill="${cor}"/><path d="${S.estrela}" fill="${LARANJA}"/></g>`
}

const arquivoFonte = readFileSync(join(raiz, "scripts/fonts/anybody-150-600.ttf"))
const fonte = opentype.parse(arquivoFonte.buffer.slice(arquivoFonte.byteOffset, arquivoFonte.byteOffset + arquivoFonte.byteLength))
const TEXTO = "GATÉLITE"
const DESTAQUE = 5
const TAMANHO = 40
const TRACKING = 0.02 * TAMANHO

const caminhoDoTexto = () => {
  let x = 0
  const partes = []
  let destaque = ""
  const glifos = [...TEXTO].map((c) => fonte.charToGlyph(c))
  let y1 = Number.POSITIVE_INFINITY
  let y2 = Number.NEGATIVE_INFINITY
  glifos.forEach((g, i) => {
    const p = g.getPath(x, 0, TAMANHO)
    if (i === DESTAQUE) destaque = p.toPathData(2)
    else partes.push(p.toPathData(2))
    const caixa = p.getBoundingBox()
    y1 = Math.min(y1, caixa.y1)
    y2 = Math.max(y2, caixa.y2)
    const prox = glifos[i + 1]
    const kern = prox ? fonte.getKerningValue(g, prox) : 0
    x += ((g.advanceWidth + kern) / fonte.unitsPerEm) * TAMANHO + (prox ? TRACKING : 0)
  })
  return { d: partes.join(""), destaque, largura: x, topo: y1, base: y2 }
}

const texto = caminhoDoTexto()
const alturaTexto = texto.base - texto.topo

const logo = (corTinta, id) => {
  const xTexto = 60
  const escala = 30 / alturaTexto
  const yTexto = 24 - ((texto.topo + texto.base) / 2) * escala
  const largura = Math.ceil(xTexto + texto.largura * escala + 2)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} 48" width="${largura * 4}" height="192" role="img" aria-label="Gatélite">${simbolo(corTinta, id, 0, 0, 0.4)}<g transform="translate(${xTexto} ${yTexto.toFixed(2)}) scale(${escala.toFixed(4)})"><path d="${texto.d}" fill="${corTinta}"/><path d="${texto.destaque}" fill="${LARANJA}"/></g></svg>`
}

const marca = (corTinta, id) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="240" height="240" role="img" aria-label="Gatélite">${simbolo(corTinta, id)}</svg>`

const logotipo = (corTinta) => {
  const l = Math.ceil(texto.largura + 2)
  const a = Math.ceil(alturaTexto + 4)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${l} ${a}" width="${l * 4}" height="${a * 4}" role="img" aria-label="Gatélite"><g transform="translate(1 ${(2 - texto.topo).toFixed(2)})"><path d="${texto.d}" fill="${corTinta}"/><path d="${texto.destaque}" fill="${LARANJA}"/></g></svg>`
}

const iconeApp = (id, tamanho = 512) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${tamanho}" height="${tamanho}"><defs><radialGradient id="${id}-brilho" cx="0.85" cy="0.1" r="0.9"><stop offset="0" stop-color="${LARANJA}" stop-opacity="0.28"/><stop offset="1" stop-color="${LARANJA}" stop-opacity="0"/></radialGradient></defs><rect width="64" height="64" rx="15" fill="${TINTA}"/><rect width="64" height="64" rx="15" fill="url(#${id}-brilho)"/>${simbolo(BRANCO, id, 8, 8, 0.4)}</svg>`

const favicon = (id) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${TINTA}"/>${simbolo(BRANCO, id, 3, 3, 0.48)}</svg>`

saida("public/brand/gatelite-mark.svg", marca(TINTA, "g"))
saida("public/brand/gatelite-mark-white.svg", marca(BRANCO, "g"))
saida("public/brand/gatelite-logo.svg", logo(TINTA, "g"))
saida("public/brand/gatelite-logo-white.svg", logo(BRANCO, "g"))
saida("public/brand/gatelite-wordmark.svg", logotipo(TINTA))
saida("public/brand/gatelite-wordmark-white.svg", logotipo(BRANCO))
saida("public/brand/gatelite-app-icon.svg", iconeApp("g"))
saida("src/app/icon.svg", favicon("g"))

saida(
  "src/components/brand/marca-dados.ts",
  `// Gerado por scripts/gerar-marca.mjs. Não editar à mão.
export const SIMBOLO = ${JSON.stringify(SIMBOLO)} as const
export const LOGOTIPO = { d: "${texto.d}", destaque: "${texto.destaque}", largura: ${texto.largura.toFixed(2)}, topo: ${texto.topo.toFixed(2)}, base: ${texto.base.toFixed(2)} } as const
export const CORES = { tinta: "${TINTA}", ambar: "${AMBAR}", laranja: "${LARANJA}" } as const
`,
)
