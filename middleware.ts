// ============================================================
// Middleware de Next.js — protección de rutas privadas
// Redirige a /auth/login si no hay cookie hub-token
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación
const PROTECTED_PATHS = [
  '/dashboard',
  '/mis-postulaciones',
  '/evaluaciones',
  '/perfil',
  '/notificaciones',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar si la ruta actual es protegida
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path))

  if (!isProtected) {
    return NextResponse.next()
  }

  // Leer cookie hub-token
  const token = request.cookies.get('hub-token')?.value

  // Si no hay token, redirigir al login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url)
    // Guardar la URL original para redirigir después del login
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verificar que el token no haya expirado (decodificación básica sin verificar firma)
  try {
    const parts = token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        const response = NextResponse.redirect(loginUrl)
        // Limpiar cookie expirada
        response.cookies.delete('hub-token')
        return response
      }
    }
  } catch {
    // Si falla la decodificación, redirigir al login
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Aplicar middleware solo a las rutas relevantes
  matcher: [
    '/dashboard/:path*',
    '/mis-postulaciones/:path*',
    '/evaluaciones/:path*',
    '/perfil',
    '/notificaciones',
  ],
}
