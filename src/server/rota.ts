export const falhar = (motivo: string, status = 502) => Response.json({ erro: motivo }, { status })

export const mensagemDeErro = (e: unknown) => (e instanceof Error ? e.message : "Falha desconhecida")

export const responder = (dados: unknown, maxAgeS: number) =>
  Response.json(dados, {
    headers: { "Cache-Control": `public, s-maxage=${maxAgeS}, stale-while-revalidate=${maxAgeS * 4}` },
  })
