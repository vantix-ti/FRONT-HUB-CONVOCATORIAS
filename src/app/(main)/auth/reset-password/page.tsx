'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { bff } from '@/lib/bff'
import { encryptPassword } from '@/lib/crypto'
import { toast } from '@/hooks/useToast'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Eye, EyeOff, KeyRound } from 'lucide-react'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!token) errs.token = 'Token inválido o expirado'
    if (!password) errs.password = 'La contraseña es requerida'
    else if (password.length < 8) errs.password = 'Mínimo 8 caracteres'
    if (password !== confirm) errs.confirm = 'Las contraseñas no coinciden'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const passwordEncrypted = await encryptPassword(password)
      await bff.post('/auth/reset-password', { token, passwordEncrypted })
      toast({ title: 'Contraseña restablecida exitosamente', variant: 'success' })
      router.push('/auth/login')
    } catch (err) {
      toast({
        title: 'Error al restablecer',
        description: err instanceof Error ? err.message : 'El enlace puede haber expirado',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-red-400">Enlace de restablecimiento inválido.</p>
        <Link href="/auth/solicitar-reset">
          <Button variant="outline">Solicitar nuevo enlace</Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password">Nueva contraseña</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPass ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="pr-10"
          />
          <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main" tabIndex={-1}>
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
        <Input
          id="confirm"
          type={showPass ? 'text' : 'password'}
          placeholder="Repite la contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={loading}
        />
        {errors.confirm && <p className="text-xs text-red-400">{errors.confirm}</p>}
      </div>
      <Button type="submit" className="w-full gap-2" disabled={loading}>
        <KeyRound className="h-4 w-4" />
        {loading ? 'Guardando...' : 'Establecer nueva contraseña'}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-main">Nueva contraseña</h1>
          <p className="mt-2 text-sm text-text-muted">Elige una contraseña segura para tu cuenta</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-8 shadow-xl">
          <Suspense fallback={<LoadingSpinner className="py-8" />}>
            <ResetPasswordContent />
          </Suspense>
        </div>
        <p className="mt-4 text-center text-sm text-text-muted">
          <Link href="/auth/login" className="text-primary hover:underline">Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  )
}
