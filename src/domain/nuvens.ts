export const fracaoDeNuvem = (rgba: ArrayLike<number>): number | null => {
  let validos = 0
  let nuvem = 0
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    const r = rgba[i] as number
    const g = rgba[i + 1] as number
    const b = rgba[i + 2] as number
    const max = Math.max(r, g, b)
    if (max < 8 || (rgba[i + 3] as number) === 0) continue
    validos++
    const min = Math.min(r, g, b)
    if (min > 115 && max - min < 45) nuvem++
  }
  return validos * 4 < rgba.length / 3 ? null : nuvem / validos
}

export const diaMaisLimpo = <T extends { nuvem: number | null }>(dias: readonly T[]): T | null =>
  dias.reduce<T | null>((melhor, d) => (d.nuvem === null ? melhor : !melhor || d.nuvem < (melhor.nuvem as number) ? d : melhor), null)
