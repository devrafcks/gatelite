import { connection } from "next/server"
import { buscarElementos } from "@/server/nasa"
import { responder } from "@/server/rota"

// roda a cada pedido (o cache fica na função de dados): nada de buscar a API no build
export async function GET() {
  await connection()
  return responder(await buscarElementos(), 3600)
}
