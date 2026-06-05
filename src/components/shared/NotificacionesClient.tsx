'use client'

import { useNotifications } from '@/hooks/useNotifications'
import { Bell, CheckCheck, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import LoadingSpinner from './LoadingSpinner'

export default function NotificacionesClient() {
  const { notificaciones, loading, marcarLeida, marcarTodasLeidas } = useNotifications()

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>

  const noLeidas = notificaciones.filter(n => !n.leida).length

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#337BD9]" />
          <span className="text-sm text-gray-400">
            {noLeidas > 0 ? `${noLeidas} sin leer` : 'Todas leídas'}
          </span>
        </div>
        {noLeidas > 0 && (
          <Button variant="ghost" size="sm" onClick={marcarTodasLeidas}
            className="text-[#337BD9] hover:text-blue-300 text-xs">
            <CheckCheck className="w-4 h-4 mr-1" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Lista */}
      {notificaciones.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No tienes notificaciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notificaciones.map(n => (
            <div key={n.id}
              className={`p-4 rounded-xl border transition-colors cursor-pointer
                ${n.leida
                  ? 'bg-[#0F1A18] border-[#1E2D2A] opacity-60'
                  : 'bg-[#0F1A18] border-[#337BD9]/30 hover:border-[#337BD9]/60'
                }`}
              onClick={() => !n.leida && marcarLeida(n.id)}>
              <div className="flex items-start gap-3">
                {!n.leida && (
                  <Circle className="w-2 h-2 mt-2 fill-[#337BD9] text-[#337BD9] flex-shrink-0" />
                )}
                <div className={!n.leida ? '' : 'ml-5'}>
                  <p className="font-medium text-sm text-white">{n.titulo}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{n.mensaje}</p>
                  <p className="text-xs text-gray-600 mt-1">{formatDate(n.creadoEn)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
