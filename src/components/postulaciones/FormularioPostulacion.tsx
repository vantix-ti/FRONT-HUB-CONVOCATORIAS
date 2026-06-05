'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/useToast'
import { getTokenClient } from '@/lib/auth'
import { updateRespuestas, enviarPostulacion } from '@/lib/api/postulaciones'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import type { Postulacion, CampoFormulario, RespuestaCampo } from '@/lib/types'
import { Save, Send } from 'lucide-react'

interface FormularioPostulacionProps {
  postulacion: Postulacion
  campos: CampoFormulario[]
  onUpdate?: (p: Postulacion) => void
}

export function FormularioPostulacion({
  postulacion,
  campos,
  onUpdate,
}: FormularioPostulacionProps) {
  // Inicializar respuestas desde las guardadas
  const initRespuestas = (): Record<string, string> => {
    const map: Record<string, string> = {}
    postulacion.respuestas?.forEach((r) => {
      map[r.campoId] =
        r.valorTexto ?? String(r.valorNumero ?? '') ?? r.valorFecha ?? ''
    })
    return map
  }

  const [respuestas, setRespuestas] = useState<Record<string, string>>(initRespuestas)
  const [saving, setSaving] = useState(false)
  const [confirmEnviar, setConfirmEnviar] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const isReadonly = postulacion.estado !== 'BORRADOR'

  function buildPayload(): RespuestaCampo[] {
    return campos.map((campo) => {
      const valor = respuestas[campo.id] ?? ''
      const r: RespuestaCampo = { campoId: campo.id }
      if (campo.tipo === 'NUMERO') {
        r.valorNumero = valor ? Number(valor) : undefined
      } else if (campo.tipo === 'FECHA') {
        r.valorFecha = valor || undefined
      } else {
        r.valorTexto = valor || undefined
      }
      return r
    })
  }

  async function handleSave() {
    const token = getTokenClient()
    if (!token) return
    setSaving(true)
    try {
      const updated = await updateRespuestas(postulacion.id, buildPayload(), token)
      toast({ title: 'Respuestas guardadas', variant: 'success' })
      onUpdate?.(updated)
    } catch (err) {
      toast({ title: 'Error al guardar', description: String(err), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleEnviar() {
    const token = getTokenClient()
    if (!token) return
    setEnviando(true)
    try {
      // Guardar primero
      await updateRespuestas(postulacion.id, buildPayload(), token)
      const updated = await enviarPostulacion(postulacion.id, token)
      toast({ title: '¡Postulación enviada exitosamente!', variant: 'success' })
      onUpdate?.(updated)
    } catch (err) {
      toast({ title: 'Error al enviar', description: String(err), variant: 'destructive' })
    } finally {
      setEnviando(false)
      setConfirmEnviar(false)
    }
  }

  function renderCampo(campo: CampoFormulario) {
    const valor = respuestas[campo.id] ?? ''
    const handleChange = (v: string) =>
      setRespuestas((prev) => ({ ...prev, [campo.id]: v }))

    return (
      <div key={campo.id} className="space-y-2">
        <Label htmlFor={campo.id}>
          {campo.nombre}
          {campo.requerido && <span className="ml-1 text-red-400">*</span>}
        </Label>
        {campo.descripcion && (
          <p className="text-xs text-text-muted">{campo.descripcion}</p>
        )}

        {campo.tipo === 'TEXTO_LARGO' ? (
          <Textarea
            id={campo.id}
            rows={4}
            value={valor}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isReadonly}
            placeholder={campo.descripcion}
          />
        ) : campo.tipo === 'NUMERO' ? (
          <Input
            id={campo.id}
            type="number"
            value={valor}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isReadonly}
          />
        ) : campo.tipo === 'FECHA' ? (
          <Input
            id={campo.id}
            type="date"
            value={valor}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isReadonly}
          />
        ) : campo.tipo === 'SELECCION' ? (
          <select
            id={campo.id}
            value={valor}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isReadonly}
            className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="">Seleccionar...</option>
            {campo.opciones?.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        ) : (
          <Input
            id={campo.id}
            type="text"
            value={valor}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isReadonly}
            placeholder={campo.descripcion}
          />
        )}
      </div>
    )
  }

  return (
    <>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {campos.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">
            Esta etapa no tiene campos configurados.
          </p>
        ) : (
          campos.sort((a, b) => a.orden - b.orden).map(renderCampo)
        )}

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
              {saving ? 'Guardando...' : 'Guardar borrador'}
            </Button>
            <Button
              type="button"
              onClick={() => setConfirmEnviar(true)}
              disabled={saving}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Enviar postulación
            </Button>
          </div>
        )}

        {isReadonly && (
          <div className="rounded-xl border border-border bg-surface-hover px-4 py-3 text-sm text-text-muted">
            Esta postulación fue enviada y ya no puede modificarse.
          </div>
        )}
      </form>

      <ConfirmModal
        open={confirmEnviar}
        onOpenChange={setConfirmEnviar}
        title="¿Enviar postulación?"
        description="Una vez enviada no podrás modificar tus respuestas. ¿Deseas continuar?"
        confirmLabel="Sí, enviar"
        cancelLabel="Revisar antes"
        onConfirm={handleEnviar}
        isLoading={enviando}
        variant="default"
      />
    </>
  )
}
