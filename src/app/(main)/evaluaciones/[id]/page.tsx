// REVISOR: formulario de evaluación — Server Component (carga datos) + Client (formulario)
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getMisEvaluaciones } from '@/lib/api/evaluaciones'
import { getEtapa } from '@/lib/api/convocatorias'
import { FormularioEvaluacion } from '@/components/evaluaciones/FormularioEvaluacion'
import { ArrowLeft, Star } from 'lucide-react'

interface Props { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: `Evaluación ${id.slice(0, 8)}` }
}

export default async function EvaluacionDetallePage({ params }: Props) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('hub-token')?.value ?? ''

  let evaluacion, criterios
  try {
    // Obtenemos todas las evaluaciones y buscamos la que corresponde al ID
    const todas = await getMisEvaluaciones(token)
    const found = todas.find((e) => e.id === id)
    if (!found) notFound()
    evaluacion = found

    // Obtener criterios de la etapa correspondiente
    const etapa = await getEtapa(evaluacion.etapaId, token)
    criterios = etapa.criterios ?? []
  } catch {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/evaluaciones"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-main transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Mis evaluaciones
      </Link>

      {/* Header */}
      <div className="mb-6 rounded-xl border border-border bg-surface px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
            <Star className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-main">
              Evaluación #{evaluacion.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-text-muted">
              Postulación #{evaluacion.postulacionId.slice(0, 8)} ·{' '}
              {evaluacion.finalizada ? 'Finalizada' : 'En progreso'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="rounded-xl border border-border bg-surface p-8">
        <FormularioEvaluacion
          evaluacion={evaluacion}
          criterios={criterios}
        />
      </div>
    </div>
  )
}
