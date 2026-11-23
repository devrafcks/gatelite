import { CORES, LOGOTIPO, SIMBOLO } from "./marca-dados"

// O símbolo como texto SVG, para onde não dá para usar componente React (imagens sociais).
export const simboloSvg = (cor = "#f4f3f1") => {
  const S = SIMBOLO
  const faixas = S.faixas.map((y) => `<rect x="20" y="${y}" width="80" height="${S.faixaAltura}" rx="${S.faixaAltura / 2}"/>`).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><clipPath id="p"><circle cx="${S.planeta.cx}" cy="${S.planeta.cy}" r="${S.planeta.r}"/></clipPath><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120"><rect width="120" height="120" fill="#fff"/><path d="${S.listras}" stroke="#000" stroke-width="2.6" stroke-linecap="round" fill="none"/></mask></defs><g clip-path="url(#p)" fill="${cor}">${faixas}</g><g fill="${cor}" mask="url(#m)"><path d="${S.corpo}"/><circle cx="${S.cabeca.cx}" cy="${S.cabeca.cy}" r="${S.cabeca.r}"/>${S.orelhas.map((o) => `<path d="${o}"/>`).join("")}</g><path d="${S.rabo}" fill="none" stroke="${cor}" stroke-width="5.2" stroke-linecap="round"/><circle cx="${S.raboPonta.cx}" cy="${S.raboPonta.cy}" r="${S.raboPonta.r}" fill="${cor}"/><path d="${S.estrela}" fill="${CORES.laranja}"/></svg>`
}

export const simboloDataUri = (cor?: string) => `data:image/svg+xml;utf8,${encodeURIComponent(simboloSvg(cor))}`


// O logotipo em curvas (GATÉLITE com o I laranja), também como texto SVG.
export const logotipoDataUri = (cor = "#f4f3f1") => {
  const altura = LOGOTIPO.base - LOGOTIPO.topo
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${LOGOTIPO.topo - 1} ${LOGOTIPO.largura + 2} ${altura + 2}"><g transform="translate(1 0)"><path d="${LOGOTIPO.d}" fill="${cor}"/><path d="${LOGOTIPO.destaque}" fill="${CORES.laranja}"/></g></svg>`
  return { uri: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, proporcao: (LOGOTIPO.largura + 2) / (altura + 2) }
}
