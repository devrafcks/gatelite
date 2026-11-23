import { connection } from "next/server"
import { buscarApod } from "@/server/nasa"
import { falhar, mensagemDeErro, responder } from "@/server/rota"

export async function GET() {
  await connection()
  try {
    return responder(await buscarApod(), 3600)
  } catch (e) {
    return falhar(`APOD indisponível: ${mensagemDeErro(e)}`)
  }
}
