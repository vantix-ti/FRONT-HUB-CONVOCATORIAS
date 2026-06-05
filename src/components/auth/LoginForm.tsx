'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/useToast'
import { encryptPassword } from '@/lib/crypto'
import { useAuth } from '@/hooks/useAuth'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!email.trim()) errs.email = 'El correo es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Correo inválido'
    if (!password) errs.password = 'La contraseña es requerida'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      // Cifrar contraseña con RSA-OAEP antes de enviar
      const passwordEncrypted = await encryptPassword(password)
      await login(email.trim().toLowerCase(), passwordEncrypted)
      toast({ title: 'Sesión iniciada correctamente', variant: 'success' })
      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Credenciales incorrectas'
      toast({ title: 'Error al iniciar sesión', description: msg, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
      </div>

      {/* Contraseña */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          <Link
            href="/auth/solicitar-reset"
            className="text-xs text-primary hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
            tabIndex={-1}
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full gap-2" disabled={loading}>
        <LogIn className="h-4 w-4" />
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>

      <p className="text-center text-sm text-text-muted">
        ¿No tienes cuenta?{' '}
        <Link href="/auth/register" className="text-primary hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </form>
  )
}
