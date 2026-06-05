// ADMIN: listado y gestión de convocatorias — Server Component
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getTodasConvocatorias } from '@/lib/api/convocatorias'
import { ConvocatoriaListAdmin } from '@/components/convocatorias/ConvocatoriaListAdmin'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const metadata: Metadata = { title: 'Gestión de Convocatorias' }
export const dynamic = 'force-dynamic'

export default async function DashboardConvocatoriasPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hub-token')?.value ?? ''

  let convocatorias = []
  let error = ''
  try {
    convocatorias = await getTodasConvocatorias(token)
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error al cargar convocatorias'
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Gestión de convocatorias</h1>
          <p className="mt-1 text-sm text-text-muted">
            {convocatorias.length} convocatoria{convocatorias.length !== 1 ? 's' : ''} en el sistema
          </p>
        </div>
        <Link href="/dashboard/convocatorias/nueva">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva convocatoria
          </Button>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Lista con acciones de admin */}
      <ConvocatoriaListAdmin convocatorias={convocatorias} />
    </div>
  )
}
