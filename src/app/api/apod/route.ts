import { connection } from "next/server"
import { buscarApod } from "@/server/nasa"
import { falhar, mensagemDeErro, responder } from "@/server/rota"

// roda a cada pedido (o cache fica na função de dados): nada de buscar a API no build
export async function GET() {
  await connection()
  try {
    return responder(await buscarApod(), 3600)
  } catch (e) {
    return falhar(`APOD indisponível: ${mensagemDeErro(e)}`)
  }
}
