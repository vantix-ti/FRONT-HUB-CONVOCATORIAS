// Detalle de convocatoria — Server Component
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getConvocatoriaPublica } from '@/lib/api/convocatorias'
import { Button } from '@/components/ui/button'
import { formatDate, getEstadoConvocatoriaInfo } from '@/lib/utils'
import { Calendar, Building2, ArrowLeft, ArrowRight } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const conv = await getConvocatoriaPublica(id)
    return { title: conv.titulo }
  } catch {
    return { title: 'Convocatoria' }
  }
}

export default async function ConvocatoriaDetallePage({ params }: Props) {
  const { id } = await params

  let convocatoria
  try {
    convocatoria = await getConvocatoriaPublica(id)
  } catch {
    notFound()
  }

  const estadoInfo = getEstadoConvocatoriaInfo(convocatoria.estado)
  const isAbierta = convocatoria.estado === 'PUBLICADA'

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Volver */}
      <Link
        href="/convocatorias"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-main transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a convocatorias
      </Link>

      {/* Tarjeta principal */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        {/* Header con estado */}
        <div className="border-b border-border px-8 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold mb-3 ${estadoInfo.color}`}>
                {estadoInfo.label}
              </span>
              <h1 className="text-2xl font-bold text-text-main">{convocatoria.titulo}</h1>
            </div>
            {isAbierta && (
              <Link href={`/auth/login?callbackUrl=/convocatorias/${id}`}>
                <Button className="gap-2 shrink-0">
                  Postularme ahora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="grid gap-4 border-b border-border px-8 py-5 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Organización</p>
              <p className="text-sm font-medium text-text-main">{convocatoria.organizacion}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Período</p>
              <p className="text-sm font-medium text-text-main">
                {formatDate(convocatoria.fechaInicio)} — {formatDate(convocatoria.fechaFin)}
              </p>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="px-8 py-6">
          <h2 className="text-lg font-semibold text-text-main mb-3">Descripción</h2>
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-text-muted leading-relaxed whitespace-pre-line">
              {convocatoria.descripcion}
            </p>
          </div>
        </div>

        {/* CTA inferior */}
        {isAbierta && (
          <div className="border-t border-border bg-primary/5 px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-text-main">¿Te interesa esta convocatoria?</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Crea una cuenta o inicia sesión para postularte
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link href="/auth/register">
                  <Button variant="outline" size="sm">Crear cuenta</Button>
                </Link>
                <Link href={`/auth/login?callbackUrl=/convocatorias/${id}`}>
                  <Button size="sm" className="gap-1.5">
                    Postularme
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
