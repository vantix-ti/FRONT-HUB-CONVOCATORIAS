// ADMIN: editar convocatoria — Client Component (carga datos server-side)
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getConvocatoriaPublica } from '@/lib/api/convocatorias'
import { ConvocatoriaForm } from '@/components/convocatorias/ConvocatoriaForm'
import { ArrowLeft } from 'lucide-react'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const conv = await getConvocatoriaPublica(id)
    return { title: `Editar — ${conv.titulo}` }
  } catch {
    return { title: 'Editar convocatoria' }
  }
}

export default async function EditarConvocatoriaPage({ params }: Props) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('hub-token')?.value ?? ''

  let convocatoria
  try {
    convocatoria = await getConvocatoriaPublica(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/dashboard/convocatorias"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-main transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a convocatorias
        </Link>
        <h1 className="text-2xl font-bold text-text-main">Editar convocatoria</h1>
        <p className="mt-1 text-sm text-text-muted">{convocatoria.titulo}</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-8">
        <ConvocatoriaForm convocatoria={convocatoria} />
      </div>
    </div>
  )
}
