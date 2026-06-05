import Link from 'next/link'
import { Calendar, Building2, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateShort, getEstadoConvocatoriaInfo, truncate } from '@/lib/utils'
import type { Convocatoria } from '@/lib/types'

interface ConvocatoriaCardProps {
  convocatoria: Convocatoria
  showActions?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ConvocatoriaCard({
  convocatoria,
  showActions = false,
  onEdit,
  onDelete,
}: ConvocatoriaCardProps) {
  const estadoInfo = getEstadoConvocatoriaInfo(convocatoria.estado)

  return (
    <Card className="flex flex-col h-full hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">
            {truncate(convocatoria.titulo, 60)}
          </CardTitle>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoInfo.color}`}
          >
            {estadoInfo.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-text-muted line-clamp-3">
          {convocatoria.descripcion}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span>{convocatoria.organizacion}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>
              {formatDateShort(convocatoria.fechaInicio)} —{' '}
              {formatDateShort(convocatoria.fechaFin)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 flex-wrap">
        <Link href={`/convocatorias/${convocatoria.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full gap-1.5">
            Ver detalle
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
        {showActions && (
          <>
            {onEdit && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onEdit(convocatoria.id)}
              >
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(convocatoria.id)}
              >
                Eliminar
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  )
}
