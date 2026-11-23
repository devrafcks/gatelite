import { connection } from "next/server"
import { buscarElementos } from "@/server/nasa"
import { responder } from "@/server/rota"

export async function GET() {
  await connection()
  return responder(await buscarElementos(), 3600)
}
