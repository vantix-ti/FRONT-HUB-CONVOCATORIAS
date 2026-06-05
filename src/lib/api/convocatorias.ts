// ============================================================
// API de Convocatorias — wrapper del BFF
// ============================================================

import { bff } from '../bff'
import type {
  Convocatoria,
  CreateConvocatoriaRequest,
  UpdateConvocatoriaRequest,
  UpdateEstadoConvocatoriaRequest,
  Etapa,
  CreateEtapaRequest,
  UpdateEtapaRequest,
  CampoFormulario,
  CreateCampoRequest,
  CriterioEvaluacion,
  CreateCriterioRequest,
} from '../types'

// ---- Convocatorias públicas ----

/** Lista de convocatorias publicadas (acceso público) */
export async function getConvocatoriasPublicas(): Promise<Convocatoria[]> {
  return bff.getCached<Convocatoria[]>('/convocatorias', 120)
}

/** Detalle de una convocatoria por ID (acceso público) */
export async function getConvocatoriaPublica(id: string): Promise<Convocatoria> {
  return bff.getCached<Convocatoria>(`/convocatorias/${id}`, 60)
}

// ---- Convocatorias ADMIN (requieren JWT) ----

/** Lista TODAS las convocatorias incluyendo borradores (ADMIN) */
export async function getTodasConvocatorias(token: string): Promise<Convocatoria[]> {
  return bff.getNoCache<Convocatoria[]>('/convocatorias/todas', { token })
}

/** Crear nueva convocatoria (ADMIN) */
export async function createConvocatoria(
  data: CreateConvocatoriaRequest,
  token: string
): Promise<Convocatoria> {
  return bff.post<Convocatoria>('/convocatorias', data, { token })
}

/** Actualizar convocatoria (ADMIN) */
export async function updateConvocatoria(
  id: string,
  data: UpdateConvocatoriaRequest,
  token: string
): Promise<Convocatoria> {
  return bff.put<Convocatoria>(`/convocatorias/${id}`, data, { token })
}

/** Cambiar estado de convocatoria (ADMIN) */
export async function updateEstadoConvocatoria(
  id: string,
  data: UpdateEstadoConvocatoriaRequest,
  token: string
): Promise<Convocatoria> {
  return bff.put<Convocatoria>(`/convocatorias/${id}/estado`, data, { token })
}

/** Eliminar convocatoria (ADMIN) */
export async function deleteConvocatoria(id: string, token: string): Promise<void> {
  return bff.delete<void>(`/convocatorias/${id}`, { token })
}

// ---- Etapas ----

/** Obtener etapas de una convocatoria (JWT) */
export async function getEtapas(convocatoriaId: string, token: string): Promise<Etapa[]> {
  return bff.getNoCache<Etapa[]>(`/convocatorias/${convocatoriaId}/etapas`, { token })
}

/** Crear etapa (ADMIN) */
export async function createEtapa(
  convocatoriaId: string,
  data: CreateEtapaRequest,
  token: string
): Promise<Etapa> {
  return bff.post<Etapa>(`/convocatorias/${convocatoriaId}/etapas`, data, { token })
}

/** Obtener etapa por ID (JWT) */
export async function getEtapa(id: string, token: string): Promise<Etapa> {
  return bff.getNoCache<Etapa>(`/etapas/${id}`, { token })
}

/** Actualizar etapa (ADMIN) */
export async function updateEtapa(
  id: string,
  data: UpdateEtapaRequest,
  token: string
): Promise<Etapa> {
  return bff.put<Etapa>(`/etapas/${id}`, data, { token })
}

/** Eliminar etapa (ADMIN) */
export async function deleteEtapa(id: string, token: string): Promise<void> {
  return bff.delete<void>(`/etapas/${id}`, { token })
}

// ---- Campos de formulario ----

/** Crear campo en etapa (ADMIN) */
export async function createCampo(
  etapaId: string,
  data: CreateCampoRequest,
  token: string
): Promise<CampoFormulario> {
  return bff.post<CampoFormulario>(`/etapas/${etapaId}/campos`, data, { token })
}

/** Actualizar campo (ADMIN) */
export async function updateCampo(
  id: string,
  data: CreateCampoRequest,
  token: string
): Promise<CampoFormulario> {
  return bff.put<CampoFormulario>(`/etapas/campos/${id}`, data, { token })
}

/** Eliminar campo (ADMIN) */
export async function deleteCampo(id: string, token: string): Promise<void> {
  return bff.delete<void>(`/etapas/campos/${id}`, { token })
}

// ---- Criterios de evaluación ----

/** Crear criterio en etapa (ADMIN) */
export async function createCriterio(
  etapaId: string,
  data: CreateCriterioRequest,
  token: string
): Promise<CriterioEvaluacion> {
  return bff.post<CriterioEvaluacion>(`/etapas/${etapaId}/criterios`, data, { token })
}

/** Actualizar criterio (ADMIN) */
export async function updateCriterio(
  id: string,
  data: CreateCriterioRequest,
  token: string
): Promise<CriterioEvaluacion> {
  return bff.put<CriterioEvaluacion>(`/etapas/criterios/${id}`, data, { token })
}

/** Eliminar criterio (ADMIN) */
export async function deleteCriterio(id: string, token: string): Promise<void> {
  return bff.delete<void>(`/etapas/criterios/${id}`, { token })
}
