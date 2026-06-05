// ============================================================
// API de Postulaciones — wrapper del BFF
// ============================================================

import { bff } from '../bff'
import type { Postulacion, CreatePostulacionRequest, RespuestaCampo } from '../types'

/** Crear postulación (POSTULANTE) */
export async function createPostulacion(
  data: CreatePostulacionRequest,
  token: string
): Promise<Postulacion> {
  return bff.post<Postulacion>('/postulaciones', data, { token })
}

/** Obtener mis postulaciones (POSTULANTE/ADMIN) */
export async function getMisPostulaciones(token: string): Promise<Postulacion[]> {
  return bff.getNoCache<Postulacion[]>('/postulaciones/mis-postulaciones', { token })
}

/** Obtener postulación por ID (JWT) */
export async function getPostulacion(id: string, token: string): Promise<Postulacion> {
  return bff.getNoCache<Postulacion>(`/postulaciones/${id}`, { token })
}

/** Guardar respuestas del formulario (POSTULANTE) */
export async function updateRespuestas(
  id: string,
  respuestas: RespuestaCampo[],
  token: string
): Promise<Postulacion> {
  return bff.put<Postulacion>(`/postulaciones/${id}/respuestas`, respuestas, { token })
}

/** Enviar postulación (POSTULANTE) */
export async function enviarPostulacion(id: string, token: string): Promise<Postulacion> {
  return bff.post<Postulacion>(`/postulaciones/${id}/enviar`, undefined, { token })
}

/** Obtener postulaciones de una convocatoria (ADMIN/REVISOR) */
export async function getPostulacionesByConvocatoria(
  convocatoriaId: string,
  token: string
): Promise<Postulacion[]> {
  return bff.getNoCache<Postulacion[]>(`/postulaciones/convocatoria/${convocatoriaId}`, { token })
}

/** Descargar PDF de postulación (JWT) */
export function getPostulacionPdfUrl(id: string): string {
  const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL ?? 'http://localhost:8081/bff'
  return `${BFF_URL}/postulaciones/${id}/pdf`
}
