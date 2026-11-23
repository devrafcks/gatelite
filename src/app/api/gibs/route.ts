import { connection } from "next/server"
import sharp from "sharp"
import { blocosDaCaixa, type Caixa, MATRIZES, urlDoBloco4326, urlWms } from "@/domain/gibs"

const LADO = 512
const MAX_BLOCOS = 40
const CACHE = "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400"

const numero = (v: string | null, min: number, max: number) => {
  const n = Number(v)
  return Number.isFinite(n) && n >= min && n <= max ? n : null
}

const lerPedido = (url: URL) => {
  const p = url.searchParams
  const camada = p.get("camada") ?? ""
  const data = p.get("data") ?? ""
  const [sul, oeste, norte, leste] = (p.get("caixa") ?? "").split(",").map(Number)
  const largura = numero(p.get("l"), 16, 2048)
  const altura = numero(p.get("a"), 16, 2048)
  const formato: "jpg" | "png" = p.get("f") === "png" ? "png" : "jpg"
  const caixa = { sul, oeste, norte, leste } as Caixa
  const valido =
    camada in MATRIZES &&
    /^\d{4}-\d{2}-\d{2}$/.test(data) &&
    [sul, oeste, norte, leste].every((v) => Number.isFinite(v)) &&
    caixa.sul >= -90 &&
    caixa.norte <= 90 &&
    caixa.oeste >= -180 &&
    caixa.leste <= 180 &&
    caixa.sul < caixa.norte &&
    caixa.oeste < caixa.leste &&
    largura !== null &&
    altura !== null
  return valido ? { camada, data, caixa, largura, altura, formato } : null
}

type Pedido = NonNullable<ReturnType<typeof lerPedido>>

const tentarWms = async (p: Pedido) => {
  try {
    const r = await fetch(urlWms(p.camada, p.data, p.caixa, p.largura, p.altura, p.formato), {
      signal: AbortSignal.timeout(6000),
    })
    if (!r.ok || !r.headers.get("content-type")?.startsWith("image/")) return null
    return { corpo: Buffer.from(await r.arrayBuffer()), tipo: r.headers.get("content-type") as string }
  } catch {
    return null
  }
}

const montarDosBlocos = async (p: Pedido) => {
  const b = blocosDaCaixa(p.camada, p.caixa, p.largura)
  const colunas = b.c1 - b.c0 + 1
  const linhas = b.l1 - b.l0 + 1
  if (colunas * linhas > MAX_BLOCOS) return null
  const pedidos: Promise<{ input: Buffer; left: number; top: number } | null>[] = []
  for (let l = b.l0; l <= b.l1; l++) {
    for (let c = b.c0; c <= b.c1; c++) {
      pedidos.push(
        fetch(urlDoBloco4326(p.camada, p.data, b.nivel, l, c), { signal: AbortSignal.timeout(10000) })
          .then(async (r) =>
            r.ok && r.headers.get("content-type")?.startsWith("image/")
              ? { input: Buffer.from(await r.arrayBuffer()), left: (c - b.c0) * LADO, top: (l - b.l0) * LADO }
              : null,
          )
          .catch(() => null),
      )
    }
  }
  const blocos = (await Promise.all(pedidos)).filter((x) => x !== null)
  if (!blocos.length) return null
  const larguraTela = colunas * LADO
  const alturaTela = linhas * LADO
  const recorte = {
    left: Math.min(b.recorte.esquerda, larguraTela - 1),
    top: Math.min(b.recorte.topo, alturaTela - 1),
    width: 0,
    height: 0,
  }
  recorte.width = Math.max(1, Math.min(b.recorte.largura, larguraTela - recorte.left))
  recorte.height = Math.max(1, Math.min(b.recorte.altura, alturaTela - recorte.top))
  const mosaico = await sharp({
    create: { width: larguraTela, height: alturaTela, channels: 4, background: { r: 0, g: 0, b: 0, alpha: p.formato === "png" ? 0 : 1 } },
  })
    .composite(blocos)
    .png()
    .toBuffer()
  const imagem = sharp(mosaico).extract(recorte).resize(p.largura, p.altura, { fit: "fill" })
  const corpo = p.formato === "png" ? await imagem.png({ compressionLevel: 8 }).toBuffer() : await imagem.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
  return { corpo, tipo: p.formato === "png" ? "image/png" : "image/jpeg" }
}

export async function GET(req: Request) {
  await connection()
  const pedido = lerPedido(new URL(req.url))
  if (!pedido) return new Response("Pedido inválido", { status: 400 })
  const imagem = (await tentarWms(pedido)) ?? (await montarDosBlocos(pedido))
  if (!imagem) return new Response("Imagem indisponível", { status: 502, headers: { "Cache-Control": "public, max-age=300" } })
  return new Response(new Uint8Array(imagem.corpo), {
    headers: { "Content-Type": imagem.tipo, "Cache-Control": CACHE },
  })
}
