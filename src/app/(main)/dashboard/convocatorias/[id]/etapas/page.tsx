// ADMIN: gestionar etapas, campos y criterios de una convocatoria
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getConvocatoriaPublica, getEtapas } from '@/lib/api/convocatorias'
import { EtapasManager } from '@/components/convocatorias/EtapasManager'
import { ArrowLeft } from 'lucide-react'

interface Props { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const conv = await getConvocatoriaPublica(id)
    return { title: `Etapas — ${conv.titulo}` }
  } catch {
    return { title: 'Gestión de etapas' }
  }
}

export default async function EtapasPage({ params }: Props) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('hub-token')?.value ?? ''

  let convocatoria, etapas
  try {
    ;[convocatoria, etapas] = await Promise.all([
      getConvocatoriaPublica(id),
      getEtapas(id, token),
    ])
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/convocatorias"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-main transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a convocatorias
        </Link>
        <h1 className="text-2xl font-bold text-text-main">Etapas de la convocatoria</h1>
        <p className="mt-1 text-sm text-text-muted">{convocatoria.titulo}</p>
      </div>

      <EtapasManager convocatoriaId={id} etapasIniciales={etapas} />
    </div>
  )
}
