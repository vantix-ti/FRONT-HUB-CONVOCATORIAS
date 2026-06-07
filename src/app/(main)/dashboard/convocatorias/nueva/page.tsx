import type { Metadata } from 'next'
import Link from 'next/link'
import { ConvocatoriaForm } from '@/components/convocatorias/ConvocatoriaForm'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Nueva Convocatoria' }

export default function NuevaConvocatoriaPage() {
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
        <h1 className="text-2xl font-bold text-text-main">Nueva convocatoria</h1>
        <p className="mt-1 text-sm text-text-muted">
          Completa la información para crear una nueva convocatoria
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-8">
        <ConvocatoriaForm />
      </div>
    </div>
  )
}
