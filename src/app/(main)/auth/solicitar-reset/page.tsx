'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { bff } from '@/lib/bff'
import { toast } from '@/hooks/useToast'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function SolicitarResetPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError('El correo es requerido'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Correo inválido'); return }
    setError('')
    setLoading(true)
    try {
      await bff.post('/auth/solicitar-reset', { email: email.trim().toLowerCase() })
      setSent(true)
    } catch (err) {
      toast({
        title: 'Error al enviar',
        description: err instanceof Error ? err.message : 'Inténtalo más tarde',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-main">Recuperar contraseña</h1>
          <p className="mt-2 text-sm text-text-muted">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-8 shadow-xl">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-7 w-7 text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-text-main">Correo enviado</h2>
              <p className="text-sm text-text-muted">
                Si existe una cuenta con ese correo, recibirás las instrucciones en breve.
                Revisa también tu carpeta de spam.
              </p>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full gap-2 mt-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  disabled={loading}
                  autoFocus
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </Button>
              <Link href="/auth/login" className="flex items-center justify-center gap-1.5 text-sm text-text-muted hover:text-text-main transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al inicio de sesión
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
