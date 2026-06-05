'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import { getTokenClient } from '@/lib/auth'
import { createConvocatoria, updateConvocatoria } from '@/lib/api/convocatorias'
import type { Convocatoria, CreateConvocatoriaRequest, EstadoConvocatoria } from '@/lib/types'

interface ConvocatoriaFormProps {
  convocatoria?: Convocatoria
  onSuccess?: (convocatoria: Convocatoria) => void
}

export function ConvocatoriaForm({ convocatoria, onSuccess }: ConvocatoriaFormProps) {
  const router = useRouter()
  const isEditing = !!convocatoria

  const [form, setForm] = useState<CreateConvocatoriaRequest>({
    titulo: convocatoria?.titulo ?? '',
    descripcion: convocatoria?.descripcion ?? '',
    fechaInicio: convocatoria?.fechaInicio?.slice(0, 10) ?? '',
    fechaFin: convocatoria?.fechaFin?.slice(0, 10) ?? '',
    organizacion: convocatoria?.organizacion ?? '',
    imagen: convocatoria?.imagen ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.titulo.trim()) errs.titulo = 'El título es requerido'
    if (!form.descripcion.trim()) errs.descripcion = 'La descripción es requerida'
    if (!form.fechaInicio) errs.fechaInicio = 'La fecha de inicio es requerida'
    if (!form.fechaFin) errs.fechaFin = 'La fecha de fin es requerida'
    if (!form.organizacion.trim()) errs.organizacion = 'La organización es requerida'
    if (form.fechaInicio && form.fechaFin && form.fechaFin < form.fechaInicio) {
      errs.fechaFin = 'La fecha de fin debe ser posterior a la de inicio'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const token = getTokenClient()
    if (!token) { toast({ title: 'Sesión expirada', variant: 'destructive' }); return }

    setLoading(true)
    try {
      let result: Convocatoria
      if (isEditing && convocatoria) {
        result = await updateConvocatoria(convocatoria.id, form, token)
        toast({ title: 'Convocatoria actualizada', variant: 'success' })
      } else {
        result = await createConvocatoria(form, token)
        toast({ title: 'Convocatoria creada exitosamente', variant: 'success' })
      }
      onSuccess ? onSuccess(result) : router.push('/dashboard/convocatorias')
    } catch (err) {
      toast({
        title: 'Error al guardar',
        description: err instanceof Error ? err.message : 'Error desconocido',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          placeholder="Nombre de la convocatoria"
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
        />
        {errors.titulo && <p className="text-xs text-red-400">{errors.titulo}</p>}
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción *</Label>
        <Textarea
          id="descripcion"
          rows={4}
          placeholder="Describe el objetivo y requisitos de la convocatoria"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />
        {errors.descripcion && <p className="text-xs text-red-400">{errors.descripcion}</p>}
      </div>

      {/* Organización */}
      <div className="space-y-2">
        <Label htmlFor="organizacion">Organización *</Label>
        <Input
          id="organizacion"
          placeholder="Nombre de la organización convocante"
          value={form.organizacion}
          onChange={(e) => setForm({ ...form, organizacion: e.target.value })}
        />
        {errors.organizacion && <p className="text-xs text-red-400">{errors.organizacion}</p>}
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fechaInicio">Fecha de inicio *</Label>
          <Input
            id="fechaInicio"
            type="date"
            value={form.fechaInicio}
            onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
          />
          {errors.fechaInicio && <p className="text-xs text-red-400">{errors.fechaInicio}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fechaFin">Fecha de fin *</Label>
          <Input
            id="fechaFin"
            type="date"
            value={form.fechaFin}
            onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
          />
          {errors.fechaFin && <p className="text-xs text-red-400">{errors.fechaFin}</p>}
        </div>
      </div>

      {/* Imagen (opcional) */}
      <div className="space-y-2">
        <Label htmlFor="imagen">URL de imagen (opcional)</Label>
        <Input
          id="imagen"
          type="url"
          placeholder="https://..."
          value={form.imagen ?? ''}
          onChange={(e) => setForm({ ...form, imagen: e.target.value })}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : isEditing ? 'Actualizar convocatoria' : 'Crear convocatoria'}
        </Button>
      </div>
    </form>
  )
}
