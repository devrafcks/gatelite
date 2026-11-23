import { connection } from "next/server"
import { buscarEventos } from "@/server/nasa"
import { falhar, mensagemDeErro, responder } from "@/server/rota"

export async function GET() {
  await connection()
  try {
    return responder(await buscarEventos(), 900)
  } catch (e) {
    return falhar(`EONET indisponível: ${mensagemDeErro(e)}`)
  }
}
