// ============================================================
// API de Evaluaciones — wrapper del BFF
// ============================================================

import { bff } from '../bff'
import type { Evaluacion, AsignarEvaluacionRequest, UpdateEvaluacionRequest, DashboardStats } from '../types'

/** Asignar evaluación a revisores (ADMIN) */
export async function asignarEvaluacion(
  data: AsignarEvaluacionRequest,
  token: string
): Promise<Evaluacion> {
  return bff.post<Evaluacion>('/evaluaciones/asignar', data, { token })
}

/** Obtener mis evaluaciones asignadas (REVISOR) */
export async function getMisEvaluaciones(token: string): Promise<Evaluacion[]> {
  return bff.getNoCache<Evaluacion[]>('/evaluaciones/mis-evaluaciones', { token })
}

/** Actualizar evaluación con comentario y puntajes (REVISOR) */
export async function updateEvaluacion(
  id: string,
  data: UpdateEvaluacionRequest,
  token: string
): Promise<Evaluacion> {
  return bff.put<Evaluacion>(`/evaluaciones/${id}`, data, { token })
}

/** Finalizar evaluación (REVISOR) */
export async function finalizarEvaluacion(id: string, token: string): Promise<Evaluacion> {
  return bff.post<Evaluacion>(`/evaluaciones/${id}/finalizar`, undefined, { token })
}

/** Notificar resultados de una etapa (ADMIN) */
export async function notificarResultados(etapaId: string, token: string): Promise<void> {
  return bff.post<void>(`/evaluaciones/etapas/${etapaId}/notificar-resultados`, undefined, { token })
}

/** Obtener dashboard de convocatoria (ADMIN/REVISOR) */
export async function getDashboardConvocatoria(
  convocatoriaId: string,
  token: string
): Promise<DashboardStats> {
  return bff.getNoCache<DashboardStats>(`/dashboard/convocatoria/${convocatoriaId}`, { token })
}
