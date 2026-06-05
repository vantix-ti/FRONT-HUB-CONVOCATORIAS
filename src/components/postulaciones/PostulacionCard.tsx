import Link from 'next/link'
import { Calendar, ArrowRight, FileDown } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDateShort, getEstadoPostulacionInfo } from '@/lib/utils'
import type { Postulacion } from '@/lib/types'

interface PostulacionCardProps {
  postulacion: Postulacion
  showFillButton?: boolean
}

export function PostulacionCard({ postulacion, showFillButton = true }: PostulacionCardProps) {
  const estadoInfo = getEstadoPostulacionInfo(postulacion.estado)
  const canFill = postulacion.estado === 'BORRADOR'

  return (
    <Card className="flex flex-col hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-text-muted">
            Postulación #{postulacion.id.slice(0, 8)}
          </CardTitle>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${estadoInfo.color}`}>
            {estadoInfo.label}
          </span>
        </div>
        {postulacion.convocatoriaTitulo && (
          <p className="text-base font-semibold text-text-main mt-1">
            {postulacion.convocatoriaTitulo}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>Enviada: {formatDateShort(postulacion.creadoEn)}</span>
        </div>
        <div className="text-xs text-text-muted">
          Respuestas guardadas: {postulacion.respuestas?.length ?? 0}
        </div>
      </CardContent>

      <CardFooter className="gap-2 flex-wrap">
        {showFillButton && canFill && (
          <Link href={`/mis-postulaciones/${postulacion.id}`} className="flex-1">
            <Button size="sm" className="w-full gap-1.5">
              Completar formulario
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
        {!canFill && (
          <Link href={`/mis-postulaciones/${postulacion.id}`} className="flex-1">
            <Button size="sm" variant="outline" className="w-full gap-1.5">
              Ver detalle
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
