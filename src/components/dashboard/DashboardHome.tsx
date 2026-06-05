'use client'

import { useAuth } from '@/hooks/useAuth'
import { StatsCard } from './StatsCard'
import { FileText, ClipboardList, Star, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function DashboardHome() {
  const { session, hasRole } = useAuth()

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div>
        <h1 className="text-2xl font-bold text-text-main">
          Bienvenido al Dashboard
        </h1>
        <p className="mt-1 text-text-muted">
          {session?.email} — Rol: {session?.roles.join(', ')}
        </p>
      </div>

      {/* Accesos rápidos por rol */}
      {hasRole('ADMIN') && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-main">Acciones rápidas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Gestionar convocatorias"
              value="ADMIN"
              description="Crear, editar y publicar convocatorias"
              icon={FileText}
            />
            <StatsCard
              title="Ver postulaciones"
              value="Revisar"
              description="Todas las postulaciones recibidas"
              icon={ClipboardList}
              iconColor="text-green-400"
            />
            <StatsCard
              title="Asignar revisores"
              value="Evaluar"
              description="Asignar evaluaciones a revisores"
              icon={Users}
              iconColor="text-purple-400"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/dashboard/convocatorias">
              <Button>Ver convocatorias</Button>
            </Link>
            <Link href="/dashboard/convocatorias/nueva">
              <Button variant="outline">Nueva convocatoria</Button>
            </Link>
          </div>
        </div>
      )}

      {hasRole('POSTULANTE') && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-main">Mis postulaciones</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatsCard
              title="Postulaciones activas"
              value="—"
              description="Revisa tus postulaciones en progreso"
              icon={ClipboardList}
            />
            <StatsCard
              title="Convocatorias abiertas"
              value="—"
              description="Explora convocatorias disponibles"
              icon={FileText}
              iconColor="text-green-400"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/mis-postulaciones">
              <Button>Ver mis postulaciones</Button>
            </Link>
            <Link href="/convocatorias">
              <Button variant="outline">Explorar convocatorias</Button>
            </Link>
          </div>
        </div>
      )}

      {hasRole('REVISOR') && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-main">Evaluaciones pendientes</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatsCard
              title="Evaluaciones asignadas"
              value="—"
              description="Postulaciones pendientes de evaluar"
              icon={Star}
              iconColor="text-yellow-400"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/evaluaciones">
              <Button>Ver mis evaluaciones</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
