// Lista de notificaciones — Server Component wrapper + Client interactivo
import type { Metadata } from 'next'
import NotificacionesClient from '@/components/shared/NotificacionesClient'

export const metadata: Metadata = { title: 'Notificaciones' }

export default function NotificacionesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-text-main mb-8">Notificaciones</h1>
      <NotificacionesClient />
    </div>
  )
}
