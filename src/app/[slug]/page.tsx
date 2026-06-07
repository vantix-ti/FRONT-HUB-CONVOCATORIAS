import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FileText, Calendar, Building2, LogIn, UserPlus } from 'lucide-react'
import { SlugTracker } from './_components/SlugTracker'

// ─── Fetch helpers (server-side) ─────────────────────────────────────────────

const BFF = process.env.NEXT_PUBLIC_BFF_URL ?? 'http://localhost:8081/bff'

async function fetchInstitucion(slug: string) {
  try {
    const res = await fetch(`${BFF}/instituciones/slug/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

async function fetchConfiguracion(slug: string) {
  try {
    const res = await fetch(`${BFF}/configuracion/public/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    return data.valores as Record<string, string>
  } catch { return null }
}

async function fetchConvocatoriasPublicas() {
  try {
    const res = await fetch(`${BFF}/convocatorias`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

// ─── Metadata dinámica ────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const inst = await fetchInstitucion(slug)
  if (!inst) return { title: 'No encontrado' }
  return {
    title: inst.nombre,
    description: `Plataforma de convocatorias de ${inst.nombre}`,
  }
}

// ─── Helpers de formato ───────────────────────────────────────────────────────

function formatFecha(fecha: string) {
  try {
    return new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return fecha }
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const [inst, cfg, convocatorias] = await Promise.all([
    fetchInstitucion(slug),
    fetchConfiguracion(slug),
    fetchConvocatoriasPublicas(),
  ])

  if (!inst) notFound()

  // Colores de la institución (con fallback)
  const colorPrimario   = cfg?.colorPrimario   ?? '#337BD9'
  const colorSecundario = cfg?.colorSecundario  ?? '#22c55e'
  const colorFondo      = cfg?.colorFondo       ?? '#08100E'
  const colorTexto      = cfg?.colorTexto       ?? '#ffffff'
  const nombre          = cfg?.nombrePlataforma ?? inst.nombre
  const descripcion     = cfg?.descripcionInicio ?? `Plataforma de convocatorias de ${inst.nombre}`
  const bienvenida      = cfg?.mensajeBienvenida ?? ''

  // Filtrar convocatorias de esta institución (por organizacion = nombre institución)
  const misConvocatorias = (convocatorias as any[]).filter(
    (c: any) => c.organizacion?.toLowerCase() === inst.nombre?.toLowerCase()
  )

  const cssVars = {
    '--color-primary':   colorPrimario,
    '--color-secondary': colorSecundario,
    '--color-bg':        colorFondo,
    '--color-text':      colorTexto,
  } as React.CSSProperties

  return (
    <div style={{ ...cssVars, backgroundColor: colorFondo, color: colorTexto, minHeight: '100vh' }}>
      {/* Guarda el slug para que logout() pueda volver acá */}
      <SlugTracker slug={slug} />

      {/* ── Header ── */}
      <header style={{ borderBottom: `1px solid ${colorPrimario}22`, backgroundColor: colorFondo + 'ee' }}
        className="sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {inst.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={inst.logoUrl} alt={inst.nombre} className="h-9 w-9 rounded-lg object-contain bg-white/10 p-0.5"/>
            ) : (
              <div className="h-9 w-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colorPrimario + '25' }}>
                <Building2 size={18} style={{ color: colorPrimario }}/>
              </div>
            )}
            <span className="text-sm font-bold" style={{ color: colorTexto }}>{nombre}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login"
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{ color: colorPrimario, border: `1px solid ${colorPrimario}55` }}>
              <LogIn size={14}/> Iniciar sesión
            </Link>
            <Link href="/auth/register"
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
              style={{ backgroundColor: colorPrimario, color: '#fff' }}>
              <UserPlus size={14}/> Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center space-y-6">
        {inst.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={inst.logoUrl} alt={inst.nombre}
            className="h-20 w-20 mx-auto rounded-2xl object-contain bg-white/10 p-2 shadow-xl"/>
        )}
        <h1 className="text-4xl font-bold leading-tight" style={{ color: colorTexto }}>
          {nombre}
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: colorTexto + 'bb' }}>
          {descripcion}
        </p>
        {bienvenida && (
          <p className="text-sm max-w-lg mx-auto rounded-xl px-6 py-4"
            style={{ backgroundColor: colorPrimario + '15', color: colorTexto + 'cc', border: `1px solid ${colorPrimario}30` }}>
            {bienvenida}
          </p>
        )}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/auth/register"
            className="rounded-xl px-8 py-3 text-sm font-semibold shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: colorPrimario, color: '#fff' }}>
            Crear cuenta gratis
          </Link>
          <Link href="/auth/login"
            className="rounded-xl px-8 py-3 text-sm font-semibold transition-colors"
            style={{ border: `1.5px solid ${colorPrimario}`, color: colorPrimario }}>
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* ── Convocatorias ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1" style={{ backgroundColor: colorPrimario + '30' }}/>
          <h2 className="text-xl font-bold" style={{ color: colorTexto }}>
            Convocatorias abiertas
          </h2>
          <div className="h-px flex-1" style={{ backgroundColor: colorPrimario + '30' }}/>
        </div>

        {misConvocatorias.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <FileText size={40} className="mx-auto opacity-30" style={{ color: colorTexto }}/>
            <p style={{ color: colorTexto + '80' }}>No hay convocatorias publicadas en este momento.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {misConvocatorias.map((c: any) => (
              <Link key={c.id} href={`/convocatorias/${c.id}`}
                className="group rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                style={{ borderColor: colorPrimario + '30', backgroundColor: colorFondo }}>
                {c.imagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imagen} alt={c.titulo}
                    className="w-full h-40 object-cover"/>
                ) : (
                  <div className="w-full h-40 flex items-center justify-center"
                    style={{ backgroundColor: colorPrimario + '15' }}>
                    <FileText size={36} style={{ color: colorPrimario + '60' }}/>
                  </div>
                )}
                <div className="p-5 space-y-2">
                  <h3 className="text-sm font-semibold leading-tight group-hover:underline"
                    style={{ color: colorTexto }}>{c.titulo}</h3>
                  {(c.fechaInicio || c.fechaFin) && (
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: colorTexto + '80' }}>
                      <Calendar size={11}/>
                      {c.fechaInicio && formatFecha(c.fechaInicio)}
                      {c.fechaFin && ` → ${formatFecha(c.fechaFin)}`}
                    </div>
                  )}
                  <div className="pt-1">
                    <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: colorSecundario + '20', color: colorSecundario }}>
                      {c.estado === 'PUBLICADA' ? 'Abierta' : c.estado}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-6 text-center text-xs"
        style={{ borderColor: colorPrimario + '20', color: colorTexto + '50' }}>
        {inst.nombre} · Powered by Hub Convocatorias
      </footer>
    </div>
  )
}
