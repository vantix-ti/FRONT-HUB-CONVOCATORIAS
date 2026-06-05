'use client'

import { Bell } from 'lucide-react'
import { useState } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function NotificacionBell() {
  const { notificaciones, noLeidas, marcarLeida, marcarTodasLeidas } = useNotifications()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      {/* Botón campana */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
        className="relative"
      >
        <Bell className="h-5 w-5 text-text-muted" />
        {noLeidas > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </Button>

      {/* Panel de notificaciones */}
      {open && (
        <>
          {/* Overlay para cerrar */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-border bg-surface shadow-xl">
            {/* Encabezado */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold text-text-main">
                Notificaciones
                {noLeidas > 0 && (
                  <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                    {noLeidas} nuevas
                  </span>
                )}
              </span>
              {noLeidas > 0 && (
                <button
                  onClick={() => marcarTodasLeidas()}
                  className="text-xs text-primary hover:underline"
                >
                  Marcar todas
                </button>
              )}
            </div>

            {/* Lista */}
            <div className="max-h-96 overflow-y-auto">
              {notificaciones.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-text-muted">
                  Sin notificaciones
                </div>
              ) : (
                notificaciones.map((n) => (
                  <div
                    key={n.id}
                    className={`border-b border-border px-4 py-3 cursor-pointer transition-colors hover:bg-surface-hover ${
                      !n.leida ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => !n.leida && marcarLeida(n.id)}
                  >
                    <div className="flex items-start gap-2">
                      {!n.leida && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                      <div className={!n.leida ? '' : 'ml-4'}>
                        <p className="text-sm font-medium text-text-main">{n.titulo}</p>
                        <p className="text-xs text-text-muted line-clamp-2">{n.mensaje}</p>
                        <p className="mt-1 text-[11px] text-text-muted/60">
                          {formatDate(n.creadoEn)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2">
              <a
                href="/notificaciones"
                className="block text-center text-xs text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                Ver todas las notificaciones
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
