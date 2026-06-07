'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getInstitucion } from '@/lib/api/instituciones'
import { getTokenClient } from '@/lib/auth'

/**
 * Devuelve true solo si el usuario autenticado tiene rol ADMIN
 * y pertenece a la institución Vantix SpA.
 */
export function useIsVantixAdmin(): { isVantixAdmin: boolean; checking: boolean } {
  const { session, hasRole } = useAuth()
  const [isVantix, setIsVantix] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Debe ser ADMIN
    if (!hasRole('ADMIN')) {
      setIsVantix(false)
      setChecking(false)
      return
    }

    const instId = session?.institucionId

    // Sin institucionId en JWT → admin legacy (Vantix)
    if (!instId) {
      setIsVantix(true)
      setChecking(false)
      return
    }

    // Con institucionId → verificar nombre de institución
    const token = getTokenClient()
    if (!token) { setChecking(false); return }

    getInstitucion(Number(instId), token)
      .then(inst => setIsVantix(inst.nombre.toLowerCase().includes('vantix')))
      .catch(() => setIsVantix(false))
      .finally(() => setChecking(false))

  }, [session?.institucionId, session?.roles]) // eslint-disable-line react-hooks/exhaustive-deps

  return { isVantixAdmin: isVantix, checking }
}
