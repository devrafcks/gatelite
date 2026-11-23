"use client"

import { parseAsFloat, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs"
import { ID_CAMADAS } from "@/domain/gibs"

export const ABAS = ["imagem", "satelites", "tempo", "eventos"] as const
export type Aba = (typeof ABAS)[number]

export const useEstadoExplorar = () =>
  useQueryStates(
    {
      lat: parseAsFloat.withDefault(-15.7939),
      lng: parseAsFloat.withDefault(-47.8828),
      z: parseAsFloat.withDefault(8),
      data: parseAsString,
      camada: parseAsStringLiteral(ID_CAMADAS).withDefault("cor-noaa20"),
      aba: parseAsStringLiteral(ABAS).withDefault("imagem"),
      nome: parseAsString,
      passagem: parseAsString,
    },
    { history: "replace", throttleMs: 250 },
  )
