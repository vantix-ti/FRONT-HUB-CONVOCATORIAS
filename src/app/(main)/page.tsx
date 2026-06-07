// Página de inicio — Server Component
// Muestra hero + lista pública de convocatorias publicadas

import Link from 'next/link'
import { getConvocatoriasPublicas } from '@/lib/api/convocatorias'
import { ConvocatoriaList } from '@/components/convocatorias/ConvocatoriaList'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Shield, Users } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inicio — Hub Convocatorias',
  description: 'Explora y participa en convocatorias activas.',
}

// Datos dinámicos — sin cache
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let convocatorias = []
  try {
    const todas = await getConvocatoriasPublicas()
    // Mostrar solo las 6 más recientes en el home
    convocatorias = todas.slice(0, 6)
  } catch {
    // Si el BFF no está disponible, mostrar lista vacía
    convocatorias = []
  }

  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Gradiente de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-6">
              <Zap className="h-3 w-3" />
              Plataforma de convocatorias
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-text-main sm:text-5xl lg:text-6xl">
              Conecta con las{' '}
              <span className="text-primary">mejores oportunidades</span>
            </h1>
            <p className="mt-6 text-lg text-text-muted max-w-2xl">
              Explora convocatorias activas, postúlate en minutos y haz seguimiento
              de tu proceso desde un solo lugar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/convocatorias">
                <Button size="lg" className="gap-2">
                  Ver convocatorias
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline">
                  Crear cuenta gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Características ──────────────────────────── */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-text-main">Postulación rápida</h3>
              <p className="mt-2 text-sm text-text-muted">
                Completa y envía tu postulación en pocos pasos desde cualquier dispositivo.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-text-main">Proceso seguro</h3>
              <p className="mt-2 text-sm text-text-muted">
                Tus datos viajan cifrados. Evaluaciones imparciales y trazables.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-text-main">Revisión experta</h3>
              <p className="mt-2 text-sm text-text-muted">
                Revisores especializados evalúan cada postulación con criterios claros.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Convocatorias recientes ───────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-main">Convocatorias activas</h2>
              <p className="mt-1 text-sm text-text-muted">
                Las oportunidades más recientes publicadas en la plataforma
              </p>
            </div>
            <Link href="/convocatorias">
              <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex">
                Ver todas
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <ConvocatoriaList
            convocatorias={convocatorias}
            emptyText="No hay convocatorias publicadas en este momento. ¡Vuelve pronto!"
          />

          {convocatorias.length > 0 && (
            <div className="mt-8 text-center">
              <Link href="/convocatorias">
                <Button variant="outline" className="gap-2">
                  Ver todas las convocatorias
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
