// ============================================================
// Hook de notificaciones — polling y gestión de estado
// ============================================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import { getTokenClient } from '@/lib/auth'
import { bff } from '@/lib/bff'
import type { Notificacion } from '@/lib/types'

interface UseNotificationsReturn {
  notificaciones: Notificacion[]
  noLeidas: number
  isLoading: boolean
  error: string | null
  marcarLeida: (id: string) => Promise<void>
  marcarTodasLeidas: () => Promise<void>
  refresh: () => Promise<void>
}

// Intervalo de polling en milisegundos (30 segundos)
const POLLING_INTERVAL = 30_000

export function useNotifications(): UseNotificationsReturn {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotificaciones = useCallback(async () => {
    const token = getTokenClient()
    if (!token) return

    try {
      setIsLoading(true)
      setError(null)
      const data = await bff.get<Notificacion[]>('/notificaciones', { token })
      setNotificaciones(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Cargar al montar y polling periódico
  useEffect(() => {
    fetchNotificaciones()
    const interval = setInterval(fetchNotificaciones, POLLING_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchNotificaciones])

  // Marcar una notificación como leída
  const marcarLeida = useCallback(
    async (id: string) => {
      const token = getTokenClient()
      if (!token) return
      try {
        await bff.put(`/notificaciones/${id}/leer`, undefined, { token })
        setNotificaciones((prev) =>
          prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
        )
      } catch (err) {
        console.error('Error al marcar notificación como leída:', err)
      }
    },
    []
  )

  // Marcar todas como leídas
  const marcarTodasLeidas = useCallback(async () => {
    const token = getTokenClient()
    if (!token) return
    try {
      await bff.put('/notificaciones/leer-todas', undefined, { token })
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err)
    }
  }, [])

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  return {
    notificaciones,
    noLeidas,
    isLoading,
    error,
    marcarLeida,
    marcarTodasLeidas,
    refresh: fetchNotificaciones,
  }
}
