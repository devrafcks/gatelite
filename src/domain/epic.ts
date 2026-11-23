export type FotoEpic = {
  readonly id: string
  readonly imagem: string
  readonly data: string
  readonly centro: { readonly lat: number; readonly lng: number }
  readonly distanciaKm: number
}

type RespostaEpic = {
  identifier: string
  image: string
  date: string
  centroid_coordinates: { lat: number; lon: number }
  dscovr_j2000_position: { x: number; y: number; z: number }
}[]

export const normalizarEpic = (r: RespostaEpic): FotoEpic[] =>
  r.map((f) => {
    const p = f.dscovr_j2000_position
    return {
      id: f.identifier,
      imagem: f.image,
      data: f.date,
      centro: { lat: f.centroid_coordinates.lat, lng: f.centroid_coordinates.lon },
      distanciaKm: Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z),
    }
  })

export const urlDaFotoEpic = (f: Pick<FotoEpic, "imagem" | "data">, tamanho: "jpg" | "thumbs" = "jpg") => {
  const [dia] = f.data.split(" ")
  const [a, m, d] = (dia ?? "").split("-")
  return `https://epic.gsfc.nasa.gov/archive/natural/${a}/${m}/${d}/${tamanho}/${f.imagem}.jpg`
}
