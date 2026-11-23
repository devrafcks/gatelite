import { connection } from "next/server"
import { buscarDatasEpic } from "@/server/nasa"
import { falhar, mensagemDeErro, responder } from "@/server/rota"

// roda a cada pedido (o cache fica na função de dados): nada de buscar a API no build
export async function GET() {
  await connection()
  try {
    return responder(await buscarDatasEpic(), 3600)
  } catch (e) {
    return falhar(`EPIC indisponível: ${mensagemDeErro(e)}`)
  }
}
