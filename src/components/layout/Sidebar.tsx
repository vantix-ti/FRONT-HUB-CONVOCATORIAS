'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useIsVantixAdmin } from '@/hooks/useIsVantixAdmin'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, FileText, ClipboardList, Star, Bell, User,
  Users, ChevronRight, Building2, FilePlus,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles?: ('ADMIN' | 'GESTOR' | 'POSTULANTE' | 'REVISOR')[]
  vantixOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',             label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/dashboard/convocatorias', label: 'Convocatorias',  icon: FileText,        roles: ['ADMIN', 'GESTOR'] },
  { href: '/mis-postulaciones',     label: 'Mis postulaciones', icon: ClipboardList,  roles: ['POSTULANTE', 'ADMIN'] },
  { href: '/evaluaciones',          label: 'Mis evaluaciones',  icon: Star,           roles: ['REVISOR'] },
  { href: '/notificaciones',        label: 'Notificaciones',    icon: Bell },
  { href: '/perfil',                label: 'Mi perfil',         icon: User },
  { href: '/dashboard/usuarios',    label: 'Usuarios',          icon: Users,           roles: ['ADMIN', 'GESTOR'] },
  {
    href: '/dashboard/instituciones',
    label: 'Instituciones',
    icon: Building2,
    roles: ['ADMIN'],
    vantixOnly: true,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { session, hasRole } = useAuth()
  const { isVantixAdmin } = useIsVantixAdmin()

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.vantixOnly && !isVantixAdmin) return false
    if (!item.roles) return true
    return item.roles.some(r => hasRole(r))
  })

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-border bg-surface">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <span className="text-[10px] font-bold text-white">HC</span>
          </div>
          <span className="text-sm font-bold text-text-main">Hub Convocatorias</span>
        </Link>
      </div>

      {/* Perfil compacto */}
      {session && (
        <div className="border-b border-border px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm mb-2">
            {(session.email || session.sub || '?').charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-medium text-text-main truncate">
            {session.email || session.sub}
          </p>
          <p className="text-xs text-text-muted">
            {Array.isArray(session.roles)
              ? session.roles.join(', ')
              : typeof session.roles === 'string'
                ? (session.roles as string).replace(/ROLE_/g, '').replace(/,/g, ', ')
                : ''}
          </p>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors group',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-text-muted hover:bg-surface-hover hover:text-text-main'
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {isActive && <ChevronRight className="h-3 w-3" />}
            </Link>
          )
        })}
      </nav>

      {/* Admin extra — solo Vantix ADMIN */}
      {isVantixAdmin && (
        <div className="border-t border-border px-3 py-4">
          <p className="px-3 py-1 text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-2">
            Administración
          </p>
          <Link
            href="/dashboard/convocatorias/nueva"
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === '/dashboard/convocatorias/nueva'
                ? 'bg-primary/15 text-primary'
                : 'text-text-muted hover:bg-surface-hover hover:text-text-main'
            )}
          >
            <FilePlus className="h-4 w-4" />
            Nueva convocatoria
          </Link>
        </div>
      )}
    </aside>
  )
}
