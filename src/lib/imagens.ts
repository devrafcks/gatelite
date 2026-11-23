import { getImageProps } from "next/image"

// Atributos de uma foto externa passando pelo otimizador do Next (AVIF/WebP no tamanho
// certo). Serve para <img> comum e para pré-carregar com new Image() usando o mesmo srcset.
export const imagemOtimizada = (src: string, sizes: string, lado = 2048) => {
  const { props } = getImageProps({ src, alt: "", width: lado, height: lado, sizes, quality: 70 })
  return { src: props.src, srcSet: props.srcSet, sizes: props.sizes }
}

// pré-carrega com o mesmo srcset/sizes do <img>: o navegador escolhe o mesmo arquivo e reaproveita
export const preCarregar = (a: ReturnType<typeof imagemOtimizada>) =>
  new Promise<void>((ok) => {
    const img = new Image()
    img.decoding = "async"
    img.onload = img.onerror = () => ok()
    if (a.sizes) img.sizes = a.sizes
    if (a.srcSet) img.srcset = a.srcSet
    img.src = a.src
  })
