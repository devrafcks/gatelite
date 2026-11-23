import { connection } from "next/server"
import { buscarDatasEpic } from "@/server/nasa"
import { falhar, mensagemDeErro, responder } from "@/server/rota"

export async function GET() {
  await connection()
  try {
    return responder(await buscarDatasEpic(), 3600)
  } catch (e) {
    return falhar(`EPIC indisponível: ${mensagemDeErro(e)}`)
  }
}
