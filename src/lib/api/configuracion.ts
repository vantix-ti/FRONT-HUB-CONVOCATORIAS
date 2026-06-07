import { bff } from '@/lib/bff'
import type { ConfiguracionPlataformaResponse } from '@/lib/types'

export async function getConfiguracion(institucionId: number, token: string): Promise<ConfiguracionPlataformaResponse> {
  return bff.getNoCache<ConfiguracionPlataformaResponse>(`/configuracion/${institucionId}`, { token })
}

export async function updateConfiguracion(
  institucionId: number,
  valores: Record<string, string>,
  token: string
): Promise<ConfiguracionPlataformaResponse> {
  return bff.put<ConfiguracionPlataformaResponse>(`/configuracion/${institucionId}`, valores, { token })
}
