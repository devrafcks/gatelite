// Cópia local dos elementos orbitais (OMM da CelesTrak), usada quando a CelesTrak não
// responde e nos testes. Rodar: pnpm elementos
import { writeFileSync } from "node:fs"
import { SATELITES } from "../src/domain/satelites.ts"

const elementos = []
for (const s of SATELITES) {
  const r = await fetch(`https://celestrak.org/NORAD/elements/gp.php?CATNR=${s.norad}&FORMAT=json`)
  const [e] = await r.json()
  if (e) elementos.push(e)
}
writeFileSync(new URL("../src/data/elementos.json", import.meta.url), `${JSON.stringify(elementos, null, 2)}\n`)
console.log(`✓ ${elementos.length} satélites`)
