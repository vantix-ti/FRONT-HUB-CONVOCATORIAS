import { bff } from '@/lib/bff'

export interface MensajeMasivoRequest {
  destinatarios: 'TODOS' | 'POSTULANTE' | 'REVISOR'
  titulo: string
  mensaje: string
}

export interface MensajeMasivoResponse {
  mensaje: string
  total: number
}

export async function enviarMensajeMasivo(
  data: MensajeMasivoRequest,
  token: string
): Promise<MensajeMasivoResponse> {
  return bff.post<MensajeMasivoResponse>('/notificaciones/masiva', data, { token })
}
