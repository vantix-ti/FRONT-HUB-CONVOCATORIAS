import { ConvocatoriaCard } from './ConvocatoriaCard'
import type { Convocatoria } from '@/lib/types'
import { FileX } from 'lucide-react'

interface ConvocatoriaListProps {
  convocatorias: Convocatoria[]
  showActions?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  emptyText?: string
}

export function ConvocatoriaList({
  convocatorias,
  showActions,
  onEdit,
  onDelete,
  emptyText = 'No hay convocatorias disponibles',
}: ConvocatoriaListProps) {
  if (convocatorias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface/50 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-hover">
          <FileX className="h-6 w-6 text-text-muted" />
        </div>
        <p className="text-sm text-text-muted">{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {convocatorias.map((convocatoria) => (
        <ConvocatoriaCard
          key={convocatoria.id}
          convocatoria={convocatoria}
          showActions={showActions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
