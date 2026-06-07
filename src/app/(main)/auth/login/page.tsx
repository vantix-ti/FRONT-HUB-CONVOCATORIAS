import { Suspense } from 'react'
import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-white">HC</span>
          </div>
          <h1 className="text-2xl font-bold text-text-main">Bienvenido de vuelta</h1>
          <p className="mt-2 text-sm text-text-muted">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Tarjeta del formulario */}
        <div className="rounded-xl border border-border bg-surface p-8 shadow-xl">
          <Suspense fallback={<LoadingSpinner className="py-8" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
