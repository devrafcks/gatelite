import { getImageProps } from "next/image"

export const imagemOtimizada = (src: string, sizes: string, lado = 2048) => {
  const { props } = getImageProps({ src, alt: "", width: lado, height: lado, sizes, quality: 70 })
  return { src: props.src, srcSet: props.srcSet, sizes: props.sizes }
}

export const preCarregar = (a: ReturnType<typeof imagemOtimizada>) =>
  new Promise<void>((ok) => {
    const img = new Image()
    img.decoding = "async"
    img.onload = img.onerror = () => ok()
    if (a.sizes) img.sizes = a.sizes
    if (a.srcSet) img.srcset = a.srcSet
    img.src = a.src
  })
