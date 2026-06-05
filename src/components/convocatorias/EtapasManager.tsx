'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/useToast'
import { getTokenClient } from '@/lib/auth'
import {
  createEtapa, deleteEtapa,
  createCampo, deleteCampo,
  createCriterio, deleteCriterio,
} from '@/lib/api/convocatorias'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import type { Etapa, CampoFormulario, CriterioEvaluacion, TipoCampo } from '@/lib/types'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

interface EtapasManagerProps {
  convocatoriaId: string
  etapasIniciales: Etapa[]
}

export function EtapasManager({ convocatoriaId, etapasIniciales }: EtapasManagerProps) {
  const [etapas, setEtapas] = useState(etapasIniciales)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newEtapa, setNewEtapa] = useState({ nombre: '', descripcion: '' })
  const [addingEtapa, setAddingEtapa] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string } | null>(null)

  async function handleAddEtapa() {
    const token = getTokenClient()
    if (!token || !newEtapa.nombre.trim()) return
    setAddingEtapa(true)
    try {
      const created = await createEtapa(
        convocatoriaId,
        { nombre: newEtapa.nombre, descripcion: newEtapa.descripcion, orden: etapas.length + 1 },
        token
      )
      setEtapas((prev) => [...prev, created])
      setNewEtapa({ nombre: '', descripcion: '' })
      toast({ title: 'Etapa creada', variant: 'success' })
    } catch (err) {
      toast({ title: 'Error al crear etapa', description: String(err), variant: 'destructive' })
    } finally {
      setAddingEtapa(false)
    }
  }

  async function handleDeleteEtapa(id: string) {
    const token = getTokenClient()
    if (!token) return
    try {
      await deleteEtapa(id, token)
      setEtapas((prev) => prev.filter((e) => e.id !== id))
      toast({ title: 'Etapa eliminada', variant: 'success' })
    } catch (err) {
      toast({ title: 'Error al eliminar etapa', description: String(err), variant: 'destructive' })
    } finally {
      setConfirmDelete(null)
    }
  }

  async function handleAddCampo(etapaId: string) {
    const token = getTokenClient()
    if (!token) return
    const etapa = etapas.find((e) => e.id === etapaId)!
    try {
      const campo = await createCampo(
        etapaId,
        { nombre: 'Nuevo campo', tipo: 'TEXTO', requerido: false, orden: (etapa.campos?.length ?? 0) + 1 },
        token
      )
      setEtapas((prev) =>
        prev.map((e) =>
          e.id === etapaId ? { ...e, campos: [...(e.campos ?? []), campo] } : e
        )
      )
      toast({ title: 'Campo agregado', variant: 'success' })
    } catch (err) {
      toast({ title: 'Error al agregar campo', description: String(err), variant: 'destructive' })
    }
  }

  async function handleDeleteCampo(etapaId: string, campoId: string) {
    const token = getTokenClient()
    if (!token) return
    try {
      await deleteCampo(campoId, token)
      setEtapas((prev) =>
        prev.map((e) =>
          e.id === etapaId
            ? { ...e, campos: e.campos.filter((c) => c.id !== campoId) }
            : e
        )
      )
      toast({ title: 'Campo eliminado', variant: 'success' })
    } catch (err) {
      toast({ title: 'Error al eliminar campo', description: String(err), variant: 'destructive' })
    } finally {
      setConfirmDelete(null)
    }
  }

  async function handleAddCriterio(etapaId: string) {
    const token = getTokenClient()
    if (!token) return
    const etapa = etapas.find((e) => e.id === etapaId)!
    try {
      const criterio = await createCriterio(
        etapaId,
        { nombre: 'Nuevo criterio', puntajeMaximo: 10, orden: (etapa.criterios?.length ?? 0) + 1 },
        token
      )
      setEtapas((prev) =>
        prev.map((e) =>
          e.id === etapaId ? { ...e, criterios: [...(e.criterios ?? []), criterio] } : e
        )
      )
      toast({ title: 'Criterio agregado', variant: 'success' })
    } catch (err) {
      toast({ title: 'Error al agregar criterio', description: String(err), variant: 'destructive' })
    }
  }

  async function handleDeleteCriterio(etapaId: string, criterioId: string) {
    const token = getTokenClient()
    if (!token) return
    try {
      await deleteCriterio(criterioId, token)
      setEtapas((prev) =>
        prev.map((e) =>
          e.id === etapaId
            ? { ...e, criterios: e.criterios.filter((c) => c.id !== criterioId) }
            : e
        )
      )
      toast({ title: 'Criterio eliminado', variant: 'success' })
    } catch (err) {
      toast({ title: 'Error al eliminar criterio', description: String(err), variant: 'destructive' })
    } finally {
      setConfirmDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Lista de etapas */}
      {etapas.length === 0 && (
        <p className="text-sm text-text-muted py-4 text-center">
          No hay etapas configuradas. Agrega la primera etapa.
        </p>
      )}

      {etapas.map((etapa) => (
        <div key={etapa.id} className="rounded-xl border border-border bg-surface overflow-hidden">
          {/* Header etapa */}
          <div className="flex items-center justify-between px-5 py-4">
            <button
              className="flex-1 text-left"
              onClick={() => setExpandedId(expandedId === etapa.id ? null : etapa.id)}
            >
              <div className="flex items-center gap-2">
                {expandedId === etapa.id ? (
                  <ChevronUp className="h-4 w-4 text-text-muted" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-text-muted" />
                )}
                <span className="font-semibold text-text-main">{etapa.nombre}</span>
                <span className="text-xs text-text-muted">
                  ({etapa.campos?.length ?? 0} campos, {etapa.criterios?.length ?? 0} criterios)
                </span>
              </div>
            </button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setConfirmDelete({ type: 'etapa', id: etapa.id })}
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </Button>
          </div>

          {/* Contenido expandido */}
          {expandedId === etapa.id && (
            <div className="border-t border-border px-5 py-4 space-y-4">
              {/* Campos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-text-main">Campos del formulario</h4>
                  <Button size="sm" variant="outline" onClick={() => handleAddCampo(etapa.id)} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Agregar campo
                  </Button>
                </div>
                {(etapa.campos ?? []).map((campo) => (
                  <div key={campo.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 mb-2">
                    <div>
                      <p className="text-sm text-text-main">{campo.nombre}</p>
                      <p className="text-xs text-text-muted">{campo.tipo} {campo.requerido ? '· Requerido' : ''}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setConfirmDelete({ type: 'campo', id: `${etapa.id}:${campo.id}` })}>
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Criterios */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-text-main">Criterios de evaluación</h4>
                  <Button size="sm" variant="outline" onClick={() => handleAddCriterio(etapa.id)} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Agregar criterio
                  </Button>
                </div>
                {(etapa.criterios ?? []).map((criterio) => (
                  <div key={criterio.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 mb-2">
                    <div>
                      <p className="text-sm text-text-main">{criterio.nombre}</p>
                      <p className="text-xs text-text-muted">Puntaje máx: {criterio.puntajeMaximo}</p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setConfirmDelete({ type: 'criterio', id: `${etapa.id}:${criterio.id}` })}>
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Agregar etapa */}
      <div className="rounded-xl border border-dashed border-border bg-surface/50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-text-main">Agregar nueva etapa</h3>
        <Input
          placeholder="Nombre de la etapa"
          value={newEtapa.nombre}
          onChange={(e) => setNewEtapa((p) => ({ ...p, nombre: e.target.value }))}
        />
        <Textarea
          placeholder="Descripción (opcional)"
          rows={2}
          value={newEtapa.descripcion}
          onChange={(e) => setNewEtapa((p) => ({ ...p, descripcion: e.target.value }))}
        />
        <Button onClick={handleAddEtapa} disabled={addingEtapa || !newEtapa.nombre.trim()} className="gap-2">
          <Plus className="h-4 w-4" />
          {addingEtapa ? 'Creando...' : 'Agregar etapa'}
        </Button>
      </div>

      {/* Modal confirmación */}
      <ConfirmModal
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title={`¿Eliminar ${confirmDelete?.type === 'etapa' ? 'etapa' : confirmDelete?.type}?`}
        description="Esta acción no puede deshacerse."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (!confirmDelete) return
          if (confirmDelete.type === 'etapa') handleDeleteEtapa(confirmDelete.id)
          else if (confirmDelete.type === 'campo') {
            const [etapaId, campoId] = confirmDelete.id.split(':')
            handleDeleteCampo(etapaId, campoId)
          } else if (confirmDelete.type === 'criterio') {
            const [etapaId, criterioId] = confirmDelete.id.split(':')
            handleDeleteCriterio(etapaId, criterioId)
          }
        }}
      />
    </div>
  )
}
