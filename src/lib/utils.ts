// ============================================================
// Utilidades compartidas
// ============================================================

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { EstadoConvocatoria, EstadoPostulacion } from './types'

/**
 * Combina clases de Tailwind CSS de forma segura (helper de Shadcn UI).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha ISO a formato legible en español.
 */
export function formatDate(isoDate: string): string {
  if (!isoDate) return '—'
  return new Date(isoDate).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formatea una fecha ISO a formato corto.
 */
export function formatDateShort(isoDate: string): string {
  if (!isoDate) return '—'
  return new Date(isoDate).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Devuelve el texto y color según el estado de convocatoria.
 */
export function getEstadoConvocatoriaInfo(estado: EstadoConvocatoria): {
  label: string
  color: string
} {
  switch (estado) {
    case 'BORRADOR':
      return { label: 'Borrador', color: 'text-yellow-400 bg-yellow-400/10' }
    case 'PUBLICADA':
      return { label: 'Publicada', color: 'text-green-400 bg-green-400/10' }
    case 'CERRADA':
      return { label: 'Cerrada', color: 'text-gray-400 bg-gray-400/10' }
    case 'CANCELADA':
      return { label: 'Cancelada', color: 'text-red-400 bg-red-400/10' }
    default:
      return { label: estado, color: 'text-gray-400 bg-gray-400/10' }
  }
}

/**
 * Devuelve el texto y color según el estado de postulación.
 */
export function getEstadoPostulacionInfo(estado: EstadoPostulacion): {
  label: string
  color: string
} {
  switch (estado) {
    case 'BORRADOR':
      return { label: 'Borrador', color: 'text-yellow-400 bg-yellow-400/10' }
    case 'ENVIADA':
      return { label: 'Enviada', color: 'text-blue-400 bg-blue-400/10' }
    case 'EN_REVISION':
      return { label: 'En revisión', color: 'text-purple-400 bg-purple-400/10' }
    case 'APROBADA':
      return { label: 'Aprobada', color: 'text-green-400 bg-green-400/10' }
    case 'RECHAZADA':
      return { label: 'Rechazada', color: 'text-red-400 bg-red-400/10' }
    default:
      return { label: estado, color: 'text-gray-400 bg-gray-400/10' }
  }
}

/**
 * Trunca un texto a un máximo de caracteres.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
