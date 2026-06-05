// ============================================================
// Manejo de sesión: cookie hub-token + decodificación JWT
// ============================================================

import type { JwtPayload, Rol } from './types'

const COOKIE_NAME = 'hub-token'

// ---- Operaciones del lado del SERVIDOR (next/headers) ----

/**
 * Lee el JWT desde la cookie hub-token (solo en Server Components / middleware).
 */
export async function getToken(): Promise<string | null> {
  try {
    // Importación dinámica para evitar errores en el cliente
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    return cookieStore.get(COOKIE_NAME)?.value ?? null
  } catch {
    return null
  }
}

/**
 * Escribe el JWT en la cookie hub-token (Server Action o Route Handler).
 */
export async function setToken(token: string): Promise<void> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    })
  } catch {
    // Ignorar en contextos donde no está disponible
  }
}

/**
 * Elimina la cookie hub-token (Server Action o Route Handler).
 */
export async function removeToken(): Promise<void> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
  } catch {
    // Ignorar en contextos donde no está disponible
  }
}

// ---- Operaciones del lado del CLIENTE ----

/**
 * Obtiene el JWT desde localStorage o cookie (cliente).
 */
export function getTokenClient(): string | null {
  if (typeof window === 'undefined') return null

  // Primero intenta localStorage
  const lsToken = localStorage.getItem(COOKIE_NAME)
  if (lsToken) return lsToken

  // Luego busca en las cookies accesibles del navegador
  const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`))
  return match ? match[2] : null
}

/**
 * Guarda el JWT en localStorage (cliente) y como cookie accesible.
 */
export function setTokenClient(token: string): void {
  if (typeof window === 'undefined') return
  const clean = token.trim()
  localStorage.setItem(COOKIE_NAME, clean)
  document.cookie = `${COOKIE_NAME}=${clean}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}


/**
 * Elimina el JWT del localStorage y de las cookies del navegador (cliente).
 */
export function removeTokenClient(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(COOKIE_NAME)
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}

// ---- Decodificación del JWT (sin verificar firma) ----

/**
 * Decodifica el payload del JWT sin verificar la firma.
 * Solo para uso en el cliente para leer roles/email.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as JwtPayload
  } catch {
    return null
  }
}

/**
 * Convierte el claim "roles" del JWT a Rol[].
 * El backend lo envía como string CSV: "ROLE_ADMIN" o "ROLE_ADMIN,ROLE_REVISOR".
 */
function normalizeRoles(raw: Rol[] | string): Rol[] {
  if (Array.isArray(raw)) return raw
  if (!raw || typeof raw !== 'string') return []
  return raw
    .split(',')
    .map((r) => r.trim().replace(/^ROLE_/, '') as Rol)
    .filter((r) => r.length > 0)
}

export function getSession(): JwtPayload | null {
  const token = getTokenClient()
  if (!token) return null
  const payload = decodeJwtPayload(token)
  if (!payload) return null
  if (payload.exp * 1000 < Date.now()) {
    removeTokenClient()
    return null
  }
  // Normalizar roles: el backend los envía como string CSV "ROLE_ADMIN"
  payload.roles = normalizeRoles(payload.roles)
  // Normalizar roles: el backend los envía como string CSV "ROLE_ADMIN"
  payload.roles = normalizeRoles(payload.roles)
  // Normalizar email: el backend usa .subject(email) → claim "sub", sin claim "email" separado
  if (!payload.email && payload.sub) {
    payload.email = payload.sub
  }
  return payload
}

export function hasRole(roles: Rol | Rol[]): boolean {
  const session = getSession()
  if (!session) return false
  const rolesArray = Array.isArray(roles) ? roles : [roles]
  const sessionRoles = normalizeRoles(session.roles)
  return sessionRoles.some((r) => rolesArray.includes(r))
}
