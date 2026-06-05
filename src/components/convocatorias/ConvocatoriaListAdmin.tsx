'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ConvocatoriaCard } from './ConvocatoriaCard'
import { ConfirmModal } from '@/components/shared/ConfirmModal'
import { toast } from '@/hooks/useToast'
import { getTokenClient } from '@/lib/auth'
import { deleteConvocatoria, updateEstadoConvocatoria } from '@/lib/api/convocatorias'
import type { Convocatoria, EstadoConvocatoria } from '@/lib/types'
import { FileX } from 'lucide-react'

interface ConvocatoriaListAdminProps {
  convocatorias: Convocatoria[]
}

export function ConvocatoriaListAdmin({ convocatorias: inicial }: ConvocatoriaListAdminProps) {
  const router = useRouter()
  const [items, setItems] = useState(inicial)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [loadingEstado, setLoadingEstado] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirmDelete) return
    const token = getTokenClient()
    if (!token) return
    setDeletingId(confirmDelete)
    try {
      await deleteConvocatoria(confirmDelete, token)
      setItems((prev) => prev.filter((c) => c.id !== confirmDelete))
      toast({ title: 'Convocatoria eliminada', variant: 'success' })
    } catch (err) {
      toast({ title: 'Error al eliminar', description: String(err), variant: 'destructive' })
    } finally {
      setDeletingId(null)
      setConfirmDelete(null)
    }
  }

  async function handleEstado(id: string, estado: EstadoConvocatoria) {
    const token = getTokenClient()
    if (!token) return
    setLoadingEstado(id)
    try {
      const updated = await updateEstadoConvocatoria(id, { estado }, token)
      setItems((prev) => prev.map((c) => (c.id === id ? updated : c)))
      toast({ title: `Estado actualizado a: ${estado}`, variant: 'success' })
    } catch (err) {
      toast({ title: 'Error al cambiar estado', description: String(err), variant: 'destructive' })
    } finally {
      setLoadingEstado(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface/50 py-16 text-center">
        <FileX className="h-10 w-10 text-text-muted" />
        <p className="text-sm text-text-muted">No hay convocatorias creadas aún.</p>
        <Link href="/dashboard/convocatorias/nueva" className="text-sm text-primary hover:underline">
          Crear la primera convocatoria
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((conv) => (
          <div key={conv.id} className="flex flex-col gap-2">
            <ConvocatoriaCard
              convocatoria={conv}
              showActions
              onEdit={(id) => router.push(`/dashboard/convocatorias/${id}/editar`)}
              onDelete={(id) => setConfirmDelete(id)}
            />
            {/* Selector rápido de estado */}
            <select
              value={conv.estado}
              disabled={loadingEstado === conv.id}
              onChange={(e) => handleEstado(conv.id, e.target.value as EstadoConvocatoria)}
              className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="BORRADOR">Borrador</option>
              <option value="PUBLICADA">Publicada</option>
              <option value="CERRADA">Cerrada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="¿Eliminar convocatoria?"
        description="Esta acción no puede deshacerse. Se eliminará la convocatoria y todos sus datos."
        confirmLabel="Sí, eliminar"
        onConfirm={handleDelete}
        isLoading={!!deletingId}
      />
    </>
  )
}
