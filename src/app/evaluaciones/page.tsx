// REVISOR: lista de evaluaciones asignadas — Server Component
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getMisEvaluaciones } from '@/lib/api/evaluaciones'
import { EvaluacionCard } from '@/components/evaluaciones/EvaluacionCard'
import { Star, FileX } from 'lucide-react'

export const metadata: Metadata = { title: 'Mis evaluaciones' }
export const dynamic = 'force-dynamic'

export default async function EvaluacionesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hub-token')?.value ?? ''

  let evaluaciones = []
  let error = ''
  try {
    evaluaciones = await getMisEvaluaciones(token)
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error al cargar evaluaciones'
  }

  const pendientes = evaluaciones.filter((e) => !e.finalizada)
  const finalizadas = evaluaciones.filter((e) => e.finalizada)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Encabezado */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Star className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-main">Mis evaluaciones</h1>
          <p className="text-sm text-text-muted">
            {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''} · {finalizadas.length} finalizada{finalizadas.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {evaluaciones.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface/50 py-16 text-center">
          <FileX className="h-10 w-10 text-text-muted" />
          <p className="text-sm text-text-muted">
            No tienes evaluaciones asignadas por el momento.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {pendientes.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-text-main mb-4">
                Pendientes ({pendientes.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pendientes.map((ev) => (
                  <EvaluacionCard key={ev.id} evaluacion={ev} />
                ))}
              </div>
            </section>
          )}
          {finalizadas.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-text-main mb-4">
                Finalizadas ({finalizadas.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {finalizadas.map((ev) => (
                  <EvaluacionCard key={ev.id} evaluacion={ev} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
