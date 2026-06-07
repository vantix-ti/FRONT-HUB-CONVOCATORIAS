// Lista completa de convocatorias públicas — Server Component
import type { Metadata } from 'next'
import { getConvocatoriasPublicas } from '@/lib/api/convocatorias'
import { ConvocatoriaList } from '@/components/convocatorias/ConvocatoriaList'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Convocatorias',
  description: 'Explora todas las convocatorias publicadas.',
}

export const dynamic = 'force-dynamic'

export default async function ConvocatoriasPage() {
  let convocatorias = []
  try {
    convocatorias = await getConvocatoriasPublicas()
  } catch {
    convocatorias = []
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-main">Convocatorias</h1>
        </div>
        <p className="text-text-muted">
          {convocatorias.length > 0
            ? `${convocatorias.length} convocatoria${convocatorias.length !== 1 ? 's' : ''} disponible${convocatorias.length !== 1 ? 's' : ''}`
            : 'Explora las oportunidades disponibles'}
        </p>
      </div>

      <ConvocatoriaList
        convocatorias={convocatorias}
        emptyText="No hay convocatorias publicadas en este momento. ¡Vuelve pronto!"
      />
    </div>
  )
}
