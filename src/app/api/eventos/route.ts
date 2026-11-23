import { connection } from "next/server"
import { buscarEventos } from "@/server/nasa"
import { falhar, mensagemDeErro, responder } from "@/server/rota"

// roda a cada pedido (o cache fica na função de dados): nada de buscar a API no build
export async function GET() {
  await connection()
  try {
    return responder(await buscarEventos(), 900)
  } catch (e) {
    return falhar(`EONET indisponível: ${mensagemDeErro(e)}`)
  }
}
