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
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import type { RegisterRequest } from '@/lib/types'

export function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido'
    if (!form.apellidoPaterno.trim()) errs.apellidoPaterno = 'El apellido paterno es requerido'
    if (!form.email.trim()) errs.email = 'El correo es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Formato de correo inválido'
    if (!form.password) errs.password = 'La contraseña es requerida'
    else if (form.password.length < 8) errs.password = 'Mínimo 8 caracteres'
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Las contraseñas no coinciden'
    if (!form.telefono.trim()) errs.telefono = 'El teléfono es requerido'
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
        nombre: form.nombre.trim(),
        apellidoPaterno: form.apellidoPaterno.trim(),
        apellidoMaterno: form.apellidoMaterno.trim(),
        email: form.email.trim().toLowerCase(),
        passwordEncrypted,
        telefono: form.telefono.trim(),
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
    } finally {
      setLoading(false)
    }
  }

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombres */}
      <div className="grid gap-4 sm:grid-cols-2">
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

      {/* Apellido materno */}
      <div className="space-y-2">
        <Label htmlFor="apellidoMaterno">Apellido materno</Label>
        <Input id="apellidoMaterno" placeholder="López (opcional)" value={form.apellidoMaterno} onChange={field('apellidoMaterno')} disabled={loading} />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico *</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="correo@ejemplo.com" value={form.email} onChange={field('email')} disabled={loading} />
        {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
      </div>

      {/* Teléfono */}
      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono *</Label>
        <Input id="telefono" type="tel" placeholder="+51 999 999 999" value={form.telefono} onChange={field('telefono')} disabled={loading} />
        {errors.telefono && <p className="text-xs text-red-400">{errors.telefono}</p>}
      </div>

      {/* Contraseña */}
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPass ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={field('password')}
            disabled={loading}
            className="pr-10"
          />
          <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main" tabIndex={-1}>
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
      </div>

      {/* Confirmar contraseña */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
        <Input
          id="confirmPassword"
          type={showPass ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          value={form.confirmPassword}
          onChange={field('confirmPassword')}
          disabled={loading}
        />
        {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
      </div>

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
