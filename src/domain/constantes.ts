// Constantes físicas. Cada uma com a unidade no nome ou no comentário.
export const RAIO_DA_TERRA_KM = 6371
export const MU_TERRA_KM3_S2 = 398_600.4418
export const CONSTANTE_SOLAR_W_M2 = 1361
// o disco do Sol visto da Terra tem 0,533°: é o que define o tamanho mínimo do feixe
export const DIAMETRO_ANGULAR_DO_SOL_RAD = 0.0093
// lúmens por watt da luz do Sol (espectro inteiro): converte irradiância em lux
export const EFICACIA_LUMINOSA_SOL_LM_W = 93
export const GRAU = Math.PI / 180
export const MS_POR_DIA = 86_400_000

export const graus = (rad: number) => rad / GRAU
export const radianos = (deg: number) => deg * GRAU
export const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
