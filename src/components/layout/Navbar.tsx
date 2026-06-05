'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { NotificacionBell } from '@/components/shared/NotificacionBell'
import { Button } from '@/components/ui/button'
import { Menu, X, LogOut, User } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { isAuthenticated, session, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-xs font-bold text-white">HC</span>
          </div>
          <span className="text-lg font-bold text-text-main">Hub Convocatorias</span>
        </Link>

        {/* Navegación escritorio */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/convocatorias"
            className="text-sm text-text-muted hover:text-text-main transition-colors"
          >
            Convocatorias
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-text-muted hover:text-text-main transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/mis-postulaciones"
                className="text-sm text-text-muted hover:text-text-main transition-colors"
              >
                Mis postulaciones
              </Link>
            </>
          )}
        </nav>

        {/* Acciones derecha */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <NotificacionBell />
              <Link href="/perfil">
                <Button variant="ghost" size="icon" aria-label="Perfil">
                  <User className="h-5 w-5 text-text-muted" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} aria-label="Cerrar sesión">
                <LogOut className="h-5 w-5 text-text-muted" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </>
          )}

          {/* Botón menú móvil */}
          <button
            className="md:hidden p-2 text-text-muted hover:text-text-main"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="border-t border-border bg-surface px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link
              href="/convocatorias"
              className="text-sm text-text-muted"
              onClick={() => setMenuOpen(false)}
            >
              Convocatorias
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-text-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/mis-postulaciones"
                  className="text-sm text-text-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  Mis postulaciones
                </Link>
                <Link
                  href="/perfil"
                  className="text-sm text-text-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  Perfil
                </Link>
                <button
                  onClick={logout}
                  className="text-left text-sm text-red-400"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
