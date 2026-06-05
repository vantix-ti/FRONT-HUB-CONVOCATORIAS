'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { bff } from '@/lib/bff'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { CheckCircle, XCircle } from 'lucide-react'

function ConfirmarEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No se encontró el token de confirmación en el enlace.')
      return
    }
    bff
      .get(`/auth/confirmar-email?token=${encodeURIComponent(token)}`)
      .then(() => {
        setStatus('success')
        setMessage('Tu correo ha sido confirmado exitosamente. Ya puedes iniciar sesión.')
      })
      .catch((err: Error) => {
        setStatus('error')
        setMessage(err.message ?? 'El enlace de confirmación es inválido o ha expirado.')
      })
  }, [token])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-10 text-center shadow-xl">
        {status === 'loading' && (
          <>
            <LoadingSpinner size="lg" className="mb-6" />
            <h1 className="text-xl font-bold text-text-main">Confirmando tu cuenta...</h1>
            <p className="mt-2 text-sm text-text-muted">Por favor espera un momento.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="text-xl font-bold text-text-main">¡Cuenta confirmada!</h1>
            <p className="mt-2 text-sm text-text-muted">{message}</p>
            <Link href="/auth/login" className="mt-6 block">
              <Button className="w-full">Iniciar sesión</Button>
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-text-main">Error de confirmación</h1>
            <p className="mt-2 text-sm text-text-muted">{message}</p>
            <Link href="/auth/register" className="mt-6 block">
              <Button variant="outline" className="w-full">Volver al registro</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function ConfirmarEmailPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" className="min-h-[60vh]" />}>
      <ConfirmarEmailContent />
    </Suspense>
  )
}
