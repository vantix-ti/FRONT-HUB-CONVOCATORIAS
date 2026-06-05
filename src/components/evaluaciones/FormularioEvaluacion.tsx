'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/useToast'
import { getTokenClient } from '@/lib/auth'
import { updateEvaluacion, finalizarEvaluacion } from '@/lib/api/evaluaciones'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import type { Evaluacion, CriterioEvaluacion } from '@/lib/types'
import { Save, CheckSquare, Star } from 'lucide-react'

interface FormularioEvaluacionProps {
  evaluacion: Evaluacion
  criterios: CriterioEvaluacion[]
  onUpdate?: (e: Evaluacion) => void
}

export function FormularioEvaluacion({
  evaluacion,
  criterios,
  onUpdate,
}: FormularioEvaluacionProps) {
  const [puntajes, setPuntajes] = useState<Record<string, number>>(
    evaluacion.puntajesPorCriterio ?? {}
  )
  const [comentario, setComentario] = useState(evaluacion.comentario ?? '')
  const [saving, setSaving] = useState(false)
  const [confirmFinalizar, setConfirmFinalizar] = useState(false)
  const [finalizando, setFinalizando] = useState(false)
  const isReadonly = evaluacion.finalizada

  const puntajeTotal = Object.values(puntajes).reduce((sum, v) => sum + v, 0)
  const puntajeMaxTotal = criterios.reduce((sum, c) => sum + c.puntajeMaximo, 0)

  async function handleSave() {
    const token = getTokenClient()
    if (!token) return
    setSaving(true)
    try {
      const updated = await updateEvaluacion(
        evaluacion.id,
        { comentario, puntajesPorCriterio: puntajes },
        token
      )
      toast({ title: 'Evaluación guardada', variant: 'success' })
      onUpdate?.(updated)
    } catch (err) {
      toast({ title: 'Error al guardar', description: String(err), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleFinalizar() {
    const token = getTokenClient()
    if (!token) return
    setFinalizando(true)
    try {
      await updateEvaluacion(evaluacion.id, { comentario, puntajesPorCriterio: puntajes }, token)
      const updated = await finalizarEvaluacion(evaluacion.id, token)
      toast({ title: 'Evaluación finalizada exitosamente', variant: 'success' })
      onUpdate?.(updated)
    } catch (err) {
      toast({ title: 'Error al finalizar', description: String(err), variant: 'destructive' })
    } finally {
      setFinalizando(false)
      setConfirmFinalizar(false)
    }
  }

  return (
    <>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Puntaje total */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-hover px-4 py-3">
          <Star className="h-5 w-5 text-yellow-400" />
          <div>
            <p className="text-sm font-semibold text-text-main">
              Puntaje total: {puntajeTotal} / {puntajeMaxTotal}
            </p>
            <p className="text-xs text-text-muted">
              {criterios.length} criterio(s) de evaluación
            </p>
          </div>
        </div>

        {/* Criterios */}
        {criterios.length === 0 ? (
          <p className="text-sm text-text-muted py-4 text-center">
            Esta etapa no tiene criterios de evaluación configurados.
          </p>
        ) : (
          criterios.sort((a, b) => a.orden - b.orden).map((criterio) => (
            <div key={criterio.id} className="space-y-2 rounded-xl border border-border p-4">
              <Label htmlFor={criterio.id}>
                {criterio.nombre}
                <span className="ml-2 text-xs font-normal text-text-muted">
                  (máx. {criterio.puntajeMaximo} pts)
                </span>
              </Label>
              {criterio.descripcion && (
                <p className="text-xs text-text-muted">{criterio.descripcion}</p>
              )}
              <Input
                id={criterio.id}
                type="number"
                min={0}
                max={criterio.puntajeMaximo}
                value={puntajes[criterio.id] ?? ''}
                onChange={(e) =>
                  setPuntajes((prev) => ({
                    ...prev,
                    [criterio.id]: Number(e.target.value),
                  }))
                }
                disabled={isReadonly}
                className="w-32"
                placeholder="0"
              />
            </div>
          ))
        )}

        {/* Comentario general */}
        <div className="space-y-2">
          <Label htmlFor="comentario">Comentario general</Label>
          <Textarea
            id="comentario"
            rows={4}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            disabled={isReadonly}
            placeholder="Ingresa tus observaciones sobre la postulación..."
          />
        </div>

        {/* Botones */}
        {!isReadonly && (
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar progreso'}
            </Button>
            <Button
              type="button"
              onClick={() => setConfirmFinalizar(true)}
              disabled={saving}
              className="gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              Finalizar evaluación
            </Button>
          </div>
        )}

        {isReadonly && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-400">
            Esta evaluación ha sido finalizada y no puede modificarse.
          </div>
        )}
      </form>

      <ConfirmModal
        open={confirmFinalizar}
        onOpenChange={setConfirmFinalizar}
        title="¿Finalizar evaluación?"
        description="Una vez finalizada no podrás modificar los puntajes ni el comentario. ¿Confirmas?"
        confirmLabel="Sí, finalizar"
        cancelLabel="Seguir revisando"
        onConfirm={handleFinalizar}
        isLoading={finalizando}
        variant="default"
      />
    </>
  )
}
