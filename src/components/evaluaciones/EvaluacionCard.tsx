import Link from 'next/link'
import { Star, ArrowRight, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDateShort } from '@/lib/utils'
import type { Evaluacion } from '@/lib/types'

interface EvaluacionCardProps {
  evaluacion: Evaluacion
}

export function EvaluacionCard({ evaluacion }: EvaluacionCardProps) {
  const puntajeTotal = Object.values(evaluacion.puntajesPorCriterio ?? {}).reduce(
    (sum, v) => sum + v,
    0
  )

  return (
    <Card className="flex flex-col hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-text-muted">
            Evaluación #{evaluacion.id.slice(0, 8)}
          </CardTitle>
          {evaluacion.finalizada ? (
            <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs text-green-400">
              <CheckCircle className="h-3 w-3" />
              Finalizada
            </span>
          ) : (
            <span className="rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs text-yellow-400">
              Pendiente
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Star className="h-3.5 w-3.5 shrink-0 text-yellow-400" />
          <span>Puntaje acumulado: {puntajeTotal}</span>
        </div>
        {evaluacion.comentario && (
          <p className="text-xs text-text-muted line-clamp-2">
            {evaluacion.comentario}
          </p>
        )}
        <p className="text-xs text-text-muted">
          Asignada: {formatDateShort(evaluacion.creadoEn)}
        </p>
      </CardContent>

      <CardFooter>
        <Link href={`/evaluaciones/${evaluacion.id}`} className="flex-1">
          <Button
            size="sm"
            variant={evaluacion.finalizada ? 'outline' : 'default'}
            className="w-full gap-1.5"
          >
            {evaluacion.finalizada ? 'Ver evaluación' : 'Evaluar ahora'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
