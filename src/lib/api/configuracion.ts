import { bff } from '@/lib/bff'
import type { ConfiguracionPlataformaResponse } from '@/lib/types'

export async function getConfiguracion(institucionId: number): Promise<ConfiguracionPlataformaResponse> {
  return bff.get<ConfiguracionPlataformaResponse>(`/configuracion/${institucionId}`)
}

export async function updateConfiguracion(
  institucionId: number,
  valores: Record<string, string>
): Promise<ConfiguracionPlataformaResponse> {
  return bff.put<ConfiguracionPlataformaResponse>(`/configuracion/${institucionId}`, valores)
}
