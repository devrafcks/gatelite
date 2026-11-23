// Sugestões instantâneas, sem rede: capitais e cidades grandes do Brasil e alguns lugares
// clássicos de imagem de satélite. Aparecem enquanto a busca de verdade ainda responde.
export type Cidade = { readonly nome: string; readonly detalhe: string; readonly lat: number; readonly lng: number }

export const CIDADES: readonly Cidade[] = [
  { nome: "São Paulo", detalhe: "SP, Brasil", lat: -23.5505, lng: -46.6333 },
  { nome: "Rio de Janeiro", detalhe: "RJ, Brasil", lat: -22.9068, lng: -43.1729 },
  { nome: "Brasília", detalhe: "DF, Brasil", lat: -15.7939, lng: -47.8828 },
  { nome: "Salvador", detalhe: "BA, Brasil", lat: -12.9714, lng: -38.5014 },
  { nome: "Fortaleza", detalhe: "CE, Brasil", lat: -3.7319, lng: -38.5267 },
  { nome: "Belo Horizonte", detalhe: "MG, Brasil", lat: -19.9167, lng: -43.9345 },
  { nome: "Manaus", detalhe: "AM, Brasil", lat: -3.119, lng: -60.0217 },
  { nome: "Curitiba", detalhe: "PR, Brasil", lat: -25.4284, lng: -49.2733 },
  { nome: "Recife", detalhe: "PE, Brasil", lat: -8.0476, lng: -34.877 },
  { nome: "Goiânia", detalhe: "GO, Brasil", lat: -16.6869, lng: -49.2648 },
  { nome: "Belém", detalhe: "PA, Brasil", lat: -1.4558, lng: -48.4902 },
  { nome: "Porto Alegre", detalhe: "RS, Brasil", lat: -30.0346, lng: -51.2177 },
  { nome: "São Luís", detalhe: "MA, Brasil", lat: -2.5307, lng: -44.3068 },
  { nome: "Maceió", detalhe: "AL, Brasil", lat: -9.6658, lng: -35.735 },
  { nome: "Natal", detalhe: "RN, Brasil", lat: -5.7945, lng: -35.211 },
  { nome: "Teresina", detalhe: "PI, Brasil", lat: -5.0892, lng: -42.8019 },
  { nome: "Campo Grande", detalhe: "MS, Brasil", lat: -20.4697, lng: -54.6201 },
  { nome: "João Pessoa", detalhe: "PB, Brasil", lat: -7.1195, lng: -34.845 },
  { nome: "Aracaju", detalhe: "SE, Brasil", lat: -10.9472, lng: -37.0731 },
  { nome: "Cuiabá", detalhe: "MT, Brasil", lat: -15.601, lng: -56.0974 },
  { nome: "Florianópolis", detalhe: "SC, Brasil", lat: -27.5954, lng: -48.548 },
  { nome: "Vitória", detalhe: "ES, Brasil", lat: -20.3155, lng: -40.3128 },
  { nome: "Porto Velho", detalhe: "RO, Brasil", lat: -8.7612, lng: -63.9004 },
  { nome: "Macapá", detalhe: "AP, Brasil", lat: 0.0349, lng: -51.0694 },
  { nome: "Rio Branco", detalhe: "AC, Brasil", lat: -9.9754, lng: -67.8249 },
  { nome: "Boa Vista", detalhe: "RR, Brasil", lat: 2.8235, lng: -60.6758 },
  { nome: "Palmas", detalhe: "TO, Brasil", lat: -10.1844, lng: -48.3336 },
  { nome: "Campinas", detalhe: "SP, Brasil", lat: -22.9099, lng: -47.0626 },
  { nome: "Santarém", detalhe: "PA, Brasil", lat: -2.4385, lng: -54.6996 },
  { nome: "Novo Progresso", detalhe: "PA, Brasil · BR-163", lat: -7.1436, lng: -55.3846 },
  { nome: "Altamira", detalhe: "PA, Brasil · Belo Monte", lat: -3.2033, lng: -52.2064 },
  { nome: "Pantanal", detalhe: "MS/MT, Brasil", lat: -18.0, lng: -56.8 },
  { nome: "Lençóis Maranhenses", detalhe: "MA, Brasil", lat: -2.4858, lng: -43.1283 },
  { nome: "Foz do Iguaçu", detalhe: "PR, Brasil", lat: -25.5163, lng: -54.5854 },
  { nome: "Fernando de Noronha", detalhe: "PE, Brasil", lat: -3.8547, lng: -32.4247 },
]

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

export const sugerirCidades = (consulta: string, limite = 4): Cidade[] => {
  const q = semAcento(consulta.trim())
  if (q.length < 2) return []
  const comeca = CIDADES.filter((c) => semAcento(c.nome).startsWith(q))
  const contem = CIDADES.filter((c) => !comeca.includes(c) && semAcento(c.nome).includes(q))
  return [...comeca, ...contem].slice(0, limite)
}
