'use client'

import { useEffect } from 'react'

/**
 * Guarda el slug de la institución en localStorage al entrar al perfil público.
 * AuthContext.logout() lo lee para redirigir de vuelta a /${slug}.
 */
export function SlugTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (slug) {
      localStorage.setItem('hub-institution-slug', slug)
    }
  }, [slug])

  return null
}
