'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/useToast'
import { encryptPassword } from '@/lib/crypto'
import { bff } from '@/lib/bff'
import { Eye, EyeOff, UserPlus, Building2, ChevronDown } from 'lucide-react'
import type { RegisterRequest, RegisterGestorRequest } from '@/lib/types'

type RolSeleccion = 'POSTULANTE' | 'GESTOR'

export function RegisterForm() {
  const router = useRouter()
  const [rolSeleccionado, setRolSeleccionado] = useState<RolSeleccion>('POSTULANTE')
  const [form, setForm] = useState({
    nombre: '', apellidoPaterno: '', apellidoMaterno: '',
    email: '', password: '', confirmPassword: '', telefono: '',
    // datos institución (solo GESTOR)
    instNombre: '', instRut: '', instDireccion: '', instTelefono: '', instEmail: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.nombre.trim())          errs.nombre          = 'El nombre es requerido'
    if (!form.apellidoPaterno.trim()) errs.apellidoPaterno = 'El apellido paterno es requerido'
    if (!form.email.trim())           errs.email           = 'El correo es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Formato de correo inválido'
    if (!form.password)               errs.password        = 'La contraseña es requerida'
    else if (form.password.length < 8) errs.password       = 'Mínimo 8 caracteres'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden'
    if (rolSeleccionado === 'GESTOR' && !form.instNombre.trim())
      errs.instNombre = 'El nombre de la institución es requerido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const passwordEncrypted = await encryptPassword(form.password)

      if (rolSeleccionado === 'GESTOR') {
        const body: RegisterGestorRequest = {
          nombre:         form.nombre.trim(),
          apellidoPaterno: form.apellidoPaterno.trim(),
          apellidoMaterno: form.apellidoMaterno.trim(),
          email:          form.email.trim().toLowerCase(),
          passwordEncrypted,
          telefono:       form.telefono.trim(),
          instNombre:     form.instNombre.trim(),
          instRut:        form.instRut.trim() || undefined,
          instDireccion:  form.instDireccion.trim() || undefined,
          instTelefono:   form.instTelefono.trim() || undefined,
          instEmail:      form.instEmail.trim() || undefined,
        }
        await bff.post('/auth/register-gestor', body)
      } else {
        const body: RegisterRequest = {
          nombre:         form.nombre.trim(),
          apellidoPaterno: form.apellidoPaterno.trim(),
          apellidoMaterno: form.apellidoMaterno.trim(),
          email:          form.email.trim().toLowerCase(),
          passwordEncrypted,
          telefono:       form.telefono.trim(),
        }
        await bff.post('/auth/register', body)
      }

      toast({
        title: 'Cuenta creada exitosamente',
        description: 'Revisa tu correo para confirmar tu cuenta.',
        variant: 'success',
      })
      router.push('/auth/login')
    } catch (err) {
      toast({
        title: 'Error al registrarse',
        description: err instanceof Error ? err.message : 'Error desconocido',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  const inputCls = "w-full"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Selector de tipo de cuenta */}
      <div className="space-y-2">
        <Label>Tipo de cuenta</Label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { val: 'POSTULANTE' as RolSeleccion, label: 'Postulante', desc: 'Participa en convocatorias' },
            { val: 'GESTOR'     as RolSeleccion, label: 'Gestor',     desc: 'Administra su institución' },
          ] as const).map(opt => (
            <button key={opt.val} type="button" onClick={() => setRolSeleccionado(opt.val)}
              className={`text-left rounded-lg border p-3 transition-colors ${
                rolSeleccionado === opt.val
                  ? 'border-primary bg-primary/10 text-white'
                  : 'border-border bg-surface/50 text-text-muted hover:border-primary/40'
              }`}>
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="text-xs opacity-70">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Datos personales */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input id="nombre" placeholder="Juan" value={form.nombre} onChange={field('nombre')} disabled={loading} />
          {errors.nombre && <p className="text-xs text-red-400">{errors.nombre}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="apellidoPaterno">Apellido paterno *</Label>
          <Input id="apellidoPaterno" placeholder="García" value={form.apellidoPaterno} onChange={field('apellidoPaterno')} disabled={loading} />
          {errors.apellidoPaterno && <p className="text-xs text-red-400">{errors.apellidoPaterno}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="apellidoMaterno">Apellido materno</Label>
        <Input id="apellidoMaterno" placeholder="López (opcional)" value={form.apellidoMaterno} onChange={field('apellidoMaterno')} disabled={loading} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico *</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="correo@ejemplo.com" value={form.email} onChange={field('email')} disabled={loading} />
        {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input id="telefono" type="tel" placeholder="+56 9 9999 9999" value={form.telefono} onChange={field('telefono')} disabled={loading} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña *</Label>
        <div className="relative">
          <Input id="password" type={showPass ? 'text' : 'password'} autoComplete="new-password"
            placeholder="Mínimo 8 caracteres" value={form.password} onChange={field('password')}
            disabled={loading} className="pr-10" />
          <button type="button" onClick={() => setShowPass(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main" tabIndex={-1}>
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
        <Input id="confirmPassword" type={showPass ? 'text' : 'password'} autoComplete="new-password"
          placeholder="Repite tu contraseña" value={form.confirmPassword} onChange={field('confirmPassword')} disabled={loading} />
        {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
      </div>

      {/* Sección de institución — solo para GESTOR */}
      {rolSeleccionado === 'GESTOR' && (
        <div className="rounded-xl border border-blue-900/40 bg-blue-900/10 p-5 space-y-4">
          <div className="flex items-center gap-2 text-blue-300">
            <Building2 size={16} />
            <span className="text-sm font-semibold">Datos de tu institución o empresa</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instNombre">Nombre de la institución *</Label>
            <Input id="instNombre" placeholder="Ej. Mi Empresa SpA" value={form.instNombre}
              onChange={field('instNombre')} disabled={loading} />
            {errors.instNombre && <p className="text-xs text-red-400">{errors.instNombre}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="instRut">RUT</Label>
              <Input id="instRut" placeholder="77.000.000-0" value={form.instRut}
                onChange={field('instRut')} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instTelefono">Teléfono institución</Label>
              <Input id="instTelefono" placeholder="+56 2 2000 0000" value={form.instTelefono}
                onChange={field('instTelefono')} disabled={loading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instDireccion">Dirección</Label>
            <Input id="instDireccion" placeholder="Av. Ejemplo 123, Santiago" value={form.instDireccion}
              onChange={field('instDireccion')} disabled={loading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instEmail">Correo institución</Label>
            <Input id="instEmail" type="email" placeholder="contacto@empresa.cl" value={form.instEmail}
              onChange={field('instEmail')} disabled={loading} />
          </div>
        </div>
      )}

      <Button type="submit" className="w-full gap-2 mt-2" disabled={loading}>
        <UserPlus className="h-4 w-4" />
        {loading ? 'Creando cuenta...' : rolSeleccionado === 'GESTOR' ? 'Crear cuenta de gestor' : 'Crear cuenta'}
      </Button>

      <p className="text-center text-sm text-text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  )
}
