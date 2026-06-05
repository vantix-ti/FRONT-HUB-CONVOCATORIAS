// POSTULANTE: formulario de una postulación específica — carga server-side
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPostulacion } from '@/lib/api/postulaciones'
import { getEtapas } from '@/lib/api/convocatorias'
import { FormularioPostulacion } from '@/components/postulaciones/FormularioPostulacion'
import { getEstadoPostulacionInfo } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

interface Props { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: `Postulación ${id.slice(0, 8)}` }
}

export default async function PostulacionDetallePage({ params }: Props) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('hub-token')?.value ?? ''

  let postulacion, etapas
  try {
    postulacion = await getPostulacion(id, token)
    etapas = await getEtapas(postulacion.convocatoriaId, token)
  } catch {
    notFound()
  }

  const primeraEtapa = etapas?.[0]
  const campos = primeraEtapa?.campos ?? []
  const estadoInfo = getEstadoPostulacionInfo(postulacion.estado)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/mis-postulaciones"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-main transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Mis postulaciones
      </Link>

      {/* Header */}
      <div className="mb-6 rounded-xl border border-border bg-surface px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text-main">
              {postulacion.convocatoriaTitulo ?? `Postulación #${id.slice(0, 8)}`}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Etapa: {primeraEtapa?.nombre ?? 'Sin etapas configuradas'}
            </p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoInfo.color}`}>
            {estadoInfo.label}
          </span>
        </div>
      </div>

      {/* Formulario */}
      <div className="rounded-xl border border-border bg-surface p-8">
        <h2 className="text-base font-semibold text-text-main mb-6">
          {primeraEtapa ? `Formulario: ${primeraEtapa.nombre}` : 'Formulario de postulación'}
        </h2>
        <FormularioPostulacion
          postulacion={postulacion}
          campos={campos}
        />
      </div>
    </div>
  )
}
