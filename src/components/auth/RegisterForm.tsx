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
import { Eye, EyeOff, UserPlus, Building2, User } from 'lucide-react'
import type { RegisterRequest } from '@/lib/types'

type TipoRegistro = 'natural' | 'empresa'

export function RegisterForm() {
  const router = useRouter()
  const [tipo, setTipo] = useState<TipoRegistro>('natural')
  const [form, setForm] = useState({
    nombre: '', apellidoPaterno: '', apellidoMaterno: '',
    email: '', password: '', confirmPassword: '', telefono: '',
    empresaNombre: '', empresaRut: '', empresaDireccion: '',
    empresaTelefono: '', empresaEmail: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.nombre.trim())           errs.nombre          = 'El nombre es requerido'
    if (!form.apellidoPaterno.trim())  errs.apellidoPaterno = 'El apellido paterno es requerido'
    if (!form.email.trim())            errs.email           = 'El correo es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Formato de correo inválido'
    if (!form.password)                errs.password        = 'La contraseña es requerida'
    else if (form.password.length < 8) errs.password        = 'Mínimo 8 caracteres'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden'
    if (tipo === 'empresa' && !form.empresaNombre.trim())
      errs.empresaNombre = 'El nombre de la empresa es requerido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const passwordEncrypted = await encryptPassword(form.password)
      const body: RegisterRequest = {
        nombre:         form.nombre.trim(),
        apellidoPaterno: form.apellidoPaterno.trim(),
        apellidoMaterno: form.apellidoMaterno.trim() || undefined,
        email:          form.email.trim().toLowerCase(),
        passwordEncrypted,
        telefono:       form.telefono.trim() || undefined,
        ...(tipo === 'empresa' ? {
          empresaNombre:    form.empresaNombre.trim(),
          empresaRut:       form.empresaRut.trim()       || undefined,
          empresaDireccion: form.empresaDireccion.trim() || undefined,
          empresaTelefono:  form.empresaTelefono.trim()  || undefined,
          empresaEmail:     form.empresaEmail.trim()     || undefined,
        } : {}),
      }
      await bff.post('/auth/register', body)
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
    } finally { setLoading(false) }
  }

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Selector tipo de registro */}
      <div className="space-y-2">
        <Label>Tipo de registro</Label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { val: 'natural' as TipoRegistro, icon: User,      label: 'Persona Natural', desc: 'Registro individual' },
            { val: 'empresa' as TipoRegistro, icon: Building2, label: 'Empresa',          desc: 'Postulas como empresa' },
          ]).map(opt => (
            <button key={opt.val} type="button" onClick={() => setTipo(opt.val)}
              className={`text-left rounded-lg border p-3 transition-colors ${
                tipo === opt.val
                  ? 'border-primary bg-primary/10 text-white'
                  : 'border-border bg-surface/50 text-text-muted hover:border-primary/40'
              }`}>
              <div className="flex items-center gap-2 mb-0.5">
                <opt.icon className="h-4 w-4" />
                <p className="text-sm font-semibold">{opt.label}</p>
              </div>
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

      {/* Datos de empresa — solo si tipo === empresa */}
      {tipo === 'empresa' && (
        <div className="rounded-xl border border-blue-900/40 bg-blue-900/10 p-5 space-y-4">
          <div className="flex items-center gap-2 text-blue-300">
            <Building2 size={15} />
            <span className="text-sm font-semibold">Datos de la empresa</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresaNombre">Nombre de la empresa *</Label>
            <Input id="empresaNombre" placeholder="Ej. Mi Empresa SpA" value={form.empresaNombre} onChange={field('empresaNombre')} disabled={loading} />
            {errors.empresaNombre && <p className="text-xs text-red-400">{errors.empresaNombre}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="empresaRut">RUT empresa</Label>
              <Input id="empresaRut" placeholder="77.000.000-0" value={form.empresaRut} onChange={field('empresaRut')} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresaTelefono">Teléfono empresa</Label>
              <Input id="empresaTelefono" placeholder="+56 2 2000 0000" value={form.empresaTelefono} onChange={field('empresaTelefono')} disabled={loading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresaDireccion">Dirección</Label>
            <Input id="empresaDireccion" placeholder="Av. Ejemplo 123, Santiago" value={form.empresaDireccion} onChange={field('empresaDireccion')} disabled={loading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresaEmail">Correo empresa</Label>
            <Input id="empresaEmail" type="email" placeholder="contacto@empresa.cl" value={form.empresaEmail} onChange={field('empresaEmail')} disabled={loading} />
          </div>
        </div>
      )}

      <Button type="submit" className="w-full gap-2 mt-2" disabled={loading}>
        <UserPlus className="h-4 w-4" />
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
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
