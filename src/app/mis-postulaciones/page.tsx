// POSTULANTE: lista de mis postulaciones — Server Component
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { getMisPostulaciones } from '@/lib/api/postulaciones'
import { PostulacionCard } from '@/components/postulaciones/PostulacionCard'
import { ClipboardList, FileX } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Mis postulaciones' }
export const dynamic = 'force-dynamic'

export default async function MisPostulacionesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hub-token')?.value ?? ''

  let postulaciones = []
  let error = ''
  try {
    postulaciones = await getMisPostulaciones(token)
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error al cargar postulaciones'
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Encabezado */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-main">Mis postulaciones</h1>
            <p className="text-sm text-text-muted">
              {postulaciones.length} postulación{postulaciones.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>
        <Link href="/convocatorias">
          <Button variant="outline" size="sm">Explorar convocatorias</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {postulaciones.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface/50 py-16 text-center">
          <FileX className="h-10 w-10 text-text-muted" />
          <p className="text-sm text-text-muted">Aún no tienes postulaciones.</p>
          <Link href="/convocatorias">
            <Button size="sm">Ver convocatorias disponibles</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {postulaciones.map((p) => (
            <PostulacionCard key={p.id} postulacion={p} />
          ))}
        </div>
      )}
    </div>
  )
}
