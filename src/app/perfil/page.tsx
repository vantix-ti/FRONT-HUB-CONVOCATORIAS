'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/useToast'
import { getTokenClient } from '@/lib/auth'
import { getMe, updateMe, cambiarPassword } from '@/lib/api/usuarios'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import type { Usuario } from '@/lib/types'
import { User, Save, KeyRound, Eye, EyeOff, Shield, CheckCircle2, Clock, Building2 } from 'lucide-react'
import { getInstitucion } from '@/lib/api/instituciones'
import type { Institucion } from '@/lib/types'

// ── helpers ──────────────────────────────────────────────────────────────────

const ROL_LABEL: Record<string, string> = {
  ADMIN: 'Administrador', REVISOR: 'Revisor', POSTULANTE: 'Postulante',
}
const ROL_COLOR: Record<string, string> = {
  ADMIN:      'bg-red-500/15 text-red-400 border-red-500/30',
  REVISOR:    'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  POSTULANTE: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
}

/** Campo de contraseña con botón mostrar/ocultar reutilizable */
function PasswordInput({ id, label, value, onChange, placeholder, disabled }: {
  id: string; label: string; value: string
  onChange: (v: string) => void; placeholder?: string; disabled?: boolean
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type={visible ? 'text' : 'password'} value={value}
          onChange={e => onChange(e.target.value)} placeholder={placeholder}
          disabled={disabled} className="pr-10" autoComplete="new-password" />
        <button type="button" tabIndex={-1}
          onClick={() => setVisible(v => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors">
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

/** Barra indicadora de fuerza de contraseña */
function PasswordStrength({ value }: { value: string }) {
  if (!value) return null
  const strength = value.length < 4 ? 1 : value.length < 7 ? 2 : value.length < 10 ? 3 : 4
  const labels = ['', 'Muy corta', 'Débil', 'Aceptable', 'Fuerte']
  const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-400', 'bg-green-400']
  return (
    <div className="space-y-1">
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className={`flex-1 rounded-full transition-colors ${n <= strength ? colors[strength] : 'bg-border'}`} />
        ))}
      </div>
      <p className="text-xs text-text-muted">{labels[strength]}</p>
    </div>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [form, setForm] = useState({ nombre: '', apellidoPaterno: '', apellidoMaterno: '', telefono: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // estado cambio de contraseña
  const [pwActual, setPwActual]   = useState('')
  const [pwNueva, setPwNueva]     = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [savingPw, setSavingPw]   = useState(false)
  const [institucion, setInstitucion] = useState<Institucion | null>(null)

  useEffect(() => {
    const token = getTokenClient()
    if (!token) return
    getMe(token)
      .then(u => {
        setUsuario(u)
        setForm({
          nombre:          u.nombre          ?? '',
          apellidoPaterno: u.apellidoPaterno ?? '',
          apellidoMaterno: u.apellidoMaterno ?? '',
          telefono:        u.telefono        ?? '',
        })
        if (u.institucionId) {
          const tk = token
          getInstitucion(u.institucionId, tk).then(setInstitucion).catch(() => {})
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const token = getTokenClient()
    if (!token) return
    setSaving(true)
    try {
      const updated = await updateMe(form, token)
      setUsuario(updated)
      toast({ title: 'Perfil actualizado exitosamente', variant: 'success' })
    } catch (err) {
      toast({ title: 'Error al actualizar perfil', description: String(err), variant: 'destructive' })
    } finally { setSaving(false) }
  }

  async function handleCambiarPassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwNueva.length < 8) {
      toast({ title: 'La nueva contraseña debe tener al menos 8 caracteres', variant: 'destructive' })
      return
    }
    if (pwNueva !== pwConfirm) {
      toast({ title: 'Las contraseñas no coinciden', variant: 'destructive' })
      return
    }
    const token = getTokenClient()
    if (!token) return
    setSavingPw(true)
    try {
      await cambiarPassword({ passwordActual: pwActual, nuevaPassword: pwNueva }, token)
      toast({ title: 'Contraseña actualizada exitosamente', variant: 'success' })
      setPwActual(''); setPwNueva(''); setPwConfirm('')
    } catch (err) {
      const msg = String(err)
      toast({
        title: 'No se pudo cambiar la contraseña',
        description: msg.toLowerCase().includes('incorrecta')
          ? 'La contraseña actual es incorrecta.'
          : msg,
        variant: 'destructive',
      })
    } finally { setSavingPw(false) }
  }

  if (loading) return <LoadingSpinner size="lg" className="min-h-[400px]" text="Cargando perfil..." />
  if (error)   return <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">{error}</div>

  // backend devuelve roles: string[] p.ej. ["ADMIN"]
  const rol = (usuario?.roles?.[0]) ?? 'POSTULANTE'

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 space-y-6">

      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-main">Mi perfil</h1>
          <p className="text-sm text-text-muted">{usuario?.email}</p>
        </div>
      </div>

      {/* Tarjeta de cuenta */}
      <div className="rounded-xl border border-border bg-surface px-6 py-4 flex flex-wrap gap-6 items-center">
        <div>
          <p className="text-xs text-text-muted mb-1">Rol en el sistema</p>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROL_COLOR[rol] ?? ''}`}>
            <Shield className="h-3 w-3" />
            {ROL_LABEL[rol] ?? rol}
          </span>
        </div>
        <div>
          <p className="text-xs text-text-muted mb-1">Estado de la cuenta</p>
          {usuario?.confirmado ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verificado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-yellow-400">
              <Clock className="h-3.5 w-3.5" /> Pendiente de verificación
            </span>
          )}
        </div>
      </div>


      {/* Institución */}
      {institucion && (
        <div className="rounded-xl border border-purple-900/30 bg-purple-900/10 px-6 py-4 flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-purple-400 shrink-0" />
            <div>
              <p className="text-xs text-text-muted mb-0.5">Institución / Empresa</p>
              <p className="text-sm font-semibold text-white">{institucion.nombre}</p>
              {institucion.rut && <p className="text-xs text-text-muted">RUT: {institucion.rut}</p>}
            </div>
          </div>
          {institucion.email && (
            <div>
              <p className="text-xs text-text-muted mb-0.5">Correo institución</p>
              <p className="text-sm text-white">{institucion.email}</p>
            </div>
          )}
          {institucion.telefono && (
            <div>
              <p className="text-xs text-text-muted mb-0.5">Teléfono</p>
              <p className="text-sm text-white">{institucion.telefono}</p>
            </div>
          )}
          {institucion.direccion && (
            <div>
              <p className="text-xs text-text-muted mb-0.5">Dirección</p>
              <p className="text-sm text-white">{institucion.direccion}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Información personal ── */}
      <div className="rounded-xl border border-border bg-surface p-8">
        <h2 className="text-base font-semibold text-text-main mb-6">Información personal</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} disabled={saving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidoPaterno">Apellido paterno</Label>
              <Input id="apellidoPaterno" value={form.apellidoPaterno}
                onChange={e => setForm(f => ({ ...f, apellidoPaterno: e.target.value }))} disabled={saving} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellidoMaterno">Apellido materno</Label>
            <Input id="apellidoMaterno" value={form.apellidoMaterno}
              onChange={e => setForm(f => ({ ...f, apellidoMaterno: e.target.value }))} disabled={saving} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" type="tel" value={form.telefono}
              onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} disabled={saving} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" value={usuario?.email ?? ''}
              disabled className="opacity-60 cursor-not-allowed" />
            <p className="text-xs text-text-muted">El correo no puede modificarse</p>
          </div>
          <Button type="submit" className="gap-2" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </form>
      </div>

      {/* ── Cambiar contraseña ── */}
      <div className="rounded-xl border border-border bg-surface p-8">
        <div className="flex items-center gap-2 mb-6">
          <KeyRound className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-text-main">Cambiar contraseña</h2>
        </div>
        <form onSubmit={handleCambiarPassword} className="space-y-5">

          {/* Contraseña actual */}
          <PasswordInput id="pwActual" label="Contraseña actual"
            value={pwActual} onChange={setPwActual}
            placeholder="Ingresa tu contraseña actual" disabled={savingPw} />

          <div className="border-t border-border pt-5 space-y-5">
            {/* Nueva contraseña */}
            <PasswordInput id="pwNueva" label="Nueva contraseña"
              value={pwNueva} onChange={setPwNueva}
              placeholder="Mínimo 8 caracteres" disabled={savingPw} />
            <PasswordStrength value={pwNueva} />

            {/* Confirmar contraseña */}
            <PasswordInput id="pwConfirm" label="Confirmar nueva contraseña"
              value={pwConfirm} onChange={setPwConfirm}
              placeholder="Repite la nueva contraseña" disabled={savingPw} />

            {/* Indicador de coincidencia */}
            {pwConfirm.length > 0 && (
              <p className={`text-xs font-medium flex items-center gap-1.5 ${pwNueva === pwConfirm ? 'text-green-400' : 'text-red-400'}`}>
                {pwNueva === pwConfirm
                  ? <><CheckCircle2 className="h-3.5 w-3.5" /> Las contraseñas coinciden</>
                  : <>Las contraseñas no coinciden</>
                }
              </p>
            )}
          </div>

          <Button type="submit" variant="outline" className="gap-2"
            disabled={savingPw || !pwActual || !pwNueva || !pwConfirm}>
            <KeyRound className="h-4 w-4" />
            {savingPw ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </form>
      </div>

    </div>
  )
}
