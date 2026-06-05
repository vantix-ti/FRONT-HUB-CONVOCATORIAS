import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Crear cuenta',
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-white">HC</span>
          </div>
          <h1 className="text-2xl font-bold text-text-main">Crea tu cuenta</h1>
          <p className="mt-2 text-sm text-text-muted">
            Únete a la plataforma y postúlate a convocatorias
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-8 shadow-xl">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
