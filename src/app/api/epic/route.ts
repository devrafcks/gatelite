import { z } from "zod"
import { buscarFotosEpic } from "@/server/nasa"
import { falhar, mensagemDeErro, responder } from "@/server/rota"

const esquema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()

export async function GET(request: Request) {
  const data = esquema.safeParse(new URL(request.url).searchParams.get("data") ?? undefined)
  if (!data.success) return falhar("Data inválida", 400)
  try {
    return responder(await buscarFotosEpic(data.data), 3600)
  } catch (e) {
    return falhar(`EPIC indisponível: ${mensagemDeErro(e)}`)
  }
}
