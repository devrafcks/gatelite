import { z } from "zod"
import { buscarLugares, normalizarConsulta } from "@/server/nasa"
import { falhar, mensagemDeErro, responder } from "@/server/rota"

const esquema = z.string().trim().min(2).max(120)

export async function GET(request: Request) {
  const q = esquema.safeParse(new URL(request.url).searchParams.get("q"))
  if (!q.success) return falhar("Digite pelo menos 2 letras", 400)
  try {
    return responder(await buscarLugares(normalizarConsulta(q.data)), 86_400)
  } catch (e) {
    return falhar(`Busca indisponível: ${mensagemDeErro(e)}`)
  }
}
