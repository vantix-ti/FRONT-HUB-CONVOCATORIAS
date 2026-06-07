'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast }    from '@/hooks/useToast'
import { getTokenClient } from '@/lib/auth'
import { useAuth }  from '@/hooks/useAuth'
import { useIsVantixAdmin } from '@/hooks/useIsVantixAdmin'
import { getInstitucion }   from '@/lib/api/instituciones'
import { createConvocatoria, updateConvocatoria } from '@/lib/api/convocatorias'
import type { Convocatoria, CreateConvocatoriaRequest, DocumentoAdjunto } from '@/lib/types'
import {
  ImagePlus, Trash2, Paperclip, Plus, X, FileText, AlertCircle,
} from 'lucide-react'

// ─── Constantes ──────────────────────────────────────────────────────────────

const IMG_MAX_MB  = 3
const IMG_TYPES   = ['image/png','image/jpeg','image/webp','image/gif','image/svg+xml']
const DOC_MAX_MB  = 10
const DOC_TYPES   = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain','text/csv',
]
const DOC_ACCEPT  = DOC_TYPES.join(',') + ',.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv'

// ─── Helper: file → base64 ───────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload  = () => res(r.result as string)
    r.onerror = () => rej(new Error('Error al leer el archivo'))
    r.readAsDataURL(file)
  })
}

// ─── ImageUploader ───────────────────────────────────────────────────────────

function ImageUploader({
  value, onChange, disabled,
}: { value?: string; onChange: (v: string | undefined) => void; disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag]   = useState(false)

  async function process(file: File) {
    if (!IMG_TYPES.includes(file.type)) {
      toast({ title: 'Formato no permitido', description: 'Usa PNG, JPG, WEBP, GIF o SVG.', variant: 'destructive' }); return
    }
    if (file.size > IMG_MAX_MB * 1024 * 1024) {
      toast({ title: `Imagen supera ${IMG_MAX_MB} MB`, variant: 'destructive' }); return
    }
    onChange(await fileToBase64(file))
  }

  if (value) return (
    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={value} alt="Imagen convocatoria" className="w-full h-full object-cover" />
      {!disabled && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
          <button type="button" onClick={() => inputRef.current?.click()}
            className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/25 flex items-center gap-1.5">
            <ImagePlus size={13}/> Cambiar
          </button>
          <button type="button" onClick={() => onChange(undefined)}
            className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/30 flex items-center gap-1.5">
            <Trash2 size={13}/> Quitar
          </button>
        </div>
      )}
      <input ref={inputRef} type="file" className="hidden" accept={IMG_TYPES.join(',')}
        onChange={e => { const f = e.target.files?.[0]; if(f) process(f); e.target.value='' }} />
    </div>
  )

  return (
    <>
      <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files?.[0];if(f)process(f)}}
        onClick={()=>!disabled && inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
          h-36 cursor-pointer transition-colors select-none
          ${drag ? 'border-primary bg-primary/10'
                 : 'border-border bg-background/50 hover:border-primary/50 hover:bg-primary/5'}
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
        <ImagePlus className={`h-7 w-7 ${drag ? 'text-primary' : 'text-text-muted'}`}/>
        <p className="text-sm text-text-muted">
          {drag ? 'Suelta aquí' : <><span className="text-primary underline underline-offset-2">Selecciona</span> o arrastra</>}
        </p>
        <p className="text-xs text-text-muted/60">PNG, JPG, WEBP, SVG · máx. {IMG_MAX_MB} MB</p>
      </div>
      <input ref={inputRef} type="file" className="hidden" accept={IMG_TYPES.join(',')}
        onChange={e=>{const f=e.target.files?.[0];if(f)process(f);e.target.value=''}} />
    </>
  )
}

// ─── Documentos Adjuntos ─────────────────────────────────────────────────────

interface DocItem {
  key: string
  nombre: string
  descripcion: string
  contenido: string
  tipoMime: string
  tamanio: number
}

function DocumentosSection({
  docs, onChange, disabled,
}: { docs: DocItem[]; onChange: (d: DocItem[]) => void; disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function addFile(file: File) {
    if (file.size > DOC_MAX_MB * 1024 * 1024) {
      toast({ title: `El archivo supera ${DOC_MAX_MB} MB`, variant: 'destructive' }); return
    }
    const b64 = await fileToBase64(file)
    const item: DocItem = {
      key: `${Date.now()}-${Math.random()}`,
      nombre: file.name, descripcion: '',
      contenido: b64, tipoMime: file.type, tamanio: file.size,
    }
    onChange([...docs, item])
  }

  function remove(key: string)  { onChange(docs.filter(d => d.key !== key)) }
  function setDesc(key: string, val: string) {
    onChange(docs.map(d => d.key === key ? { ...d, descripcion: val.slice(0, 100) } : d))
  }

  function formatSize(bytes: number) {
    if (bytes < 1024)        return `${bytes} B`
    if (bytes < 1024*1024)   return `${(bytes/1024).toFixed(1)} KB`
    return `${(bytes/1024/1024).toFixed(1)} MB`
  }

  return (
    <div className="space-y-3">
      {docs.map(doc => (
        <div key={doc.key}
          className="rounded-xl border border-border bg-background/60 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0 mt-0.5">
              <FileText className="h-4 w-4 text-primary"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-main truncate">{doc.nombre}</p>
              <p className="text-xs text-text-muted mt-0.5">{formatSize(doc.tamanio)} · {doc.tipoMime}</p>
            </div>
            {!disabled && (
              <button type="button" onClick={() => remove(doc.key)}
                className="text-text-muted hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10 shrink-0">
                <X className="h-4 w-4"/>
              </button>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Descripción</Label>
              <span className={`text-xs ${doc.descripcion.length >= 90 ? 'text-amber-400' : 'text-text-muted'}`}>
                {doc.descripcion.length}/100
              </span>
            </div>
            <Input
              value={doc.descripcion}
              onChange={e => setDesc(doc.key, e.target.value)}
              placeholder="Describe brevemente este documento…"
              disabled={disabled}
              maxLength={100}
              className="text-sm"
            />
            {doc.descripcion.length === 0 && (
              <p className="flex items-center gap-1 text-xs text-amber-400/80">
                <AlertCircle size={11}/> La descripción es opcional pero recomendada
              </p>
            )}
          </div>
        </div>
      ))}

      {!disabled && (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border
            py-3 text-sm text-text-muted transition-colors
            hover:border-primary/50 hover:text-primary hover:bg-primary/5">
          <Plus className="h-4 w-4"/> Agregar documento
        </button>
      )}
      <input ref={inputRef} type="file" className="hidden" accept={DOC_ACCEPT}
        onChange={e => { const f = e.target.files?.[0]; if (f) addFile(f); e.target.value = '' }} />
      <p className="text-xs text-text-muted/60">
        Formatos: PDF, Word, Excel, CSV, TXT · Máx. {DOC_MAX_MB} MB por archivo
      </p>
    </div>
  )
}

// ─── ConvocatoriaForm (principal) ────────────────────────────────────────────

interface ConvocatoriaFormProps {
  convocatoria?: Convocatoria
  onSuccess?: (c: Convocatoria) => void
}

export function ConvocatoriaForm({ convocatoria, onSuccess }: ConvocatoriaFormProps) {
  const router     = useRouter()
  const { session } = useAuth()
  const { isVantixAdmin } = useIsVantixAdmin()
  const isEditing  = !!convocatoria

  const [form, setForm] = useState<CreateConvocatoriaRequest>({
    titulo:       convocatoria?.titulo       ?? '',
    descripcion:  convocatoria?.descripcion  ?? '',
    fechaInicio:  convocatoria?.fechaInicio?.slice(0,10) ?? '',
    fechaFin:     convocatoria?.fechaFin?.slice(0,10)    ?? '',
    organizacion: convocatoria?.organizacion ?? '',
    imagen:       convocatoria?.imagen       ?? undefined,
    documentos:   [],
  })
  const [docs,    setDocs]    = useState<DocItem[]>(
    (convocatoria?.documentos ?? []).map(d => ({
      key: String(d.id ?? Math.random()),
      nombre: d.nombre, descripcion: d.descripcion ?? '',
      contenido: d.contenido, tipoMime: d.tipoMime ?? '',
      tamanio: d.tamanio ?? 0,
    }))
  )
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState<Record<string,string>>({})
  const [orgReadonly, setOrgReadonly] = useState(false)

  // Auto-fill organizacion para GESTOR
  useEffect(() => {
    const token = getTokenClient()
    if (!token || isVantixAdmin || isEditing) return
    const instId = session?.institucionId
    if (!instId) return
    getInstitucion(Number(instId), token)
      .then(inst => {
        setForm(f => ({ ...f, organizacion: inst.nombre }))
        setOrgReadonly(true)
      })
      .catch(() => {})
  }, [session?.institucionId, isVantixAdmin, isEditing])

  function validate() {
    const errs: Record<string,string> = {}
    if (!form.titulo.trim())       errs.titulo       = 'El título es requerido'
    if (!form.descripcion.trim())  errs.descripcion  = 'La descripción es requerida'
    if (!form.fechaInicio)         errs.fechaInicio  = 'La fecha de inicio es requerida'
    if (!form.fechaFin)            errs.fechaFin     = 'La fecha de fin es requerida'
    if (!orgReadonly && !form.organizacion.trim())
                                   errs.organizacion = 'La organización es requerida'
    if (form.fechaInicio && form.fechaFin && form.fechaFin < form.fechaInicio)
                                   errs.fechaFin     = 'Debe ser posterior a la fecha de inicio'
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
      const payload: CreateConvocatoriaRequest = {
        ...form,
        documentos: docs.map(d => ({
          nombre: d.nombre, descripcion: d.descripcion || undefined,
          contenido: d.contenido, tipoMime: d.tipoMime, tamanio: d.tamanio,
        } as DocumentoAdjunto)),
      }
      let result: Convocatoria
      if (isEditing && convocatoria) {
        result = await updateConvocatoria(convocatoria.id, payload, token)
        toast({ title: 'Convocatoria actualizada', variant: 'success' })
      } else {
        result = await createConvocatoria(payload, token)
        toast({ title: 'Convocatoria creada exitosamente', variant: 'success' })
      }
      onSuccess ? onSuccess(result) : router.push('/dashboard/convocatorias')
    } catch (err) {
      toast({ title: 'Error al guardar', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' })
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">

      {/* Imagen */}
      <div className="space-y-2">
        <Label>Imagen de portada</Label>
        <ImageUploader
          value={form.imagen}
          onChange={v => setForm(f => ({ ...f, imagen: v }))}
          disabled={loading}
        />
      </div>

      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="titulo">Título *</Label>
        <Input id="titulo" placeholder="Nombre de la convocatoria"
          value={form.titulo} onChange={e => setForm(f => ({...f, titulo: e.target.value}))}
          disabled={loading}/>
        {errors.titulo && <p className="text-xs text-red-400">{errors.titulo}</p>}
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción *</Label>
        <Textarea id="descripcion" rows={5} placeholder="Describe el objetivo y requisitos de la convocatoria"
          value={form.descripcion} onChange={e => setForm(f => ({...f, descripcion: e.target.value}))}
          disabled={loading}/>
        {errors.descripcion && <p className="text-xs text-red-400">{errors.descripcion}</p>}
      </div>

      {/* Organización — readonly para GESTOR */}
      <div className="space-y-2">
        <Label htmlFor="organizacion">Organización *</Label>
        {orgReadonly ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2">
            <span className="text-sm text-text-main flex-1">{form.organizacion}</span>
            <span className="text-xs text-text-muted/60 shrink-0">Auto-asignada</span>
          </div>
        ) : (
          <Input id="organizacion" placeholder="Nombre de la organización convocante"
            value={form.organizacion} onChange={e => setForm(f => ({...f, organizacion: e.target.value}))}
            disabled={loading}/>
        )}
        {errors.organizacion && <p className="text-xs text-red-400">{errors.organizacion}</p>}
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fechaInicio">Fecha de inicio *</Label>
          <Input id="fechaInicio" type="date"
            value={form.fechaInicio} onChange={e => setForm(f => ({...f, fechaInicio: e.target.value}))}
            disabled={loading}/>
          {errors.fechaInicio && <p className="text-xs text-red-400">{errors.fechaInicio}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fechaFin">Fecha de fin *</Label>
          <Input id="fechaFin" type="date"
            value={form.fechaFin} onChange={e => setForm(f => ({...f, fechaFin: e.target.value}))}
            disabled={loading}/>
          {errors.fechaFin && <p className="text-xs text-red-400">{errors.fechaFin}</p>}
        </div>
      </div>

      {/* Documentos adjuntos */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-text-muted"/>
          <Label>Documentos adjuntos</Label>
          <span className="text-xs text-text-muted/60">(opcional)</span>
        </div>
        <DocumentosSection docs={docs} onChange={setDocs} disabled={loading}/>
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
