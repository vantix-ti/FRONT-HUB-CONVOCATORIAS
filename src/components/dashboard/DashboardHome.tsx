'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { getDashboardGlobal } from '@/lib/api/dashboard'
import type { DashboardGlobal } from '@/lib/types'
import {
  FileText,
  ClipboardList,
  Users,
  Star,
  Layers,
  CheckSquare,
  UserCheck,
  Trophy,
  BarChart2,
  MessageSquare,
  Archive,
  Settings,
  Clock,
  TrendingUp,
} from 'lucide-react'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const ESTADO_LABELS: Record<string, string> = {
  EN_CREACION: 'En creación',
  ENVIADA: 'Enviadas',
  EN_EVALUACION: 'En evaluación',
  SELECCIONADA: 'Seleccionadas',
  NO_SELECCIONADA: 'No selec.',
}

const ESTADO_COLORS: Record<string, string> = {
  EN_CREACION: '#6366f1',
  ENVIADA: '#337BD9',
  EN_EVALUACION: '#f59e0b',
  SELECCIONADA: '#22c55e',
  NO_SELECCIONADA: '#ef4444',
}

const ESTADO_BADGE: Record<string, string> = {
  EN_CREACION: 'bg-indigo-500/20 text-indigo-300',
  ENVIADA: 'bg-blue-500/20 text-blue-300',
  EN_EVALUACION: 'bg-amber-500/20 text-amber-300',
  SELECCIONADA: 'bg-green-500/20 text-green-300',
  NO_SELECCIONADA: 'bg-red-500/20 text-red-300',
}

function formatFecha(fechaStr: string): string {
  try {
    const d = new Date(fechaStr)
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return fechaStr
  }
}

function getInitial(nombre: string): string {
  return (nombre ?? '?').charAt(0).toUpperCase()
}

// ─────────────────────────────────────────────
// Sub-componentes internos
// ─────────────────────────────────────────────

interface KpiCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  iconColor: string
  trend?: string
}

function KpiCard({ title, value, subtitle, icon: Icon, iconColor, trend }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-[#1e3a34] bg-[#0d1f1c] p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-sm text-[#8aa8a0] font-medium">{title}</p>
        <div className={`p-2 rounded-lg bg-[#132d28] ${iconColor}`}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value}</p>
        {trend && (
          <p className="text-xs text-green-400 mt-0.5 flex items-center gap-1">
            <TrendingUp size={11} />
            {trend}
          </p>
        )}
      </div>
      <p className="text-xs text-[#8aa8a0]">{subtitle}</p>
    </div>
  )
}

interface AccesoRapidoProps {
  label: string
  icon: React.ElementType
  href?: string
  disabled?: boolean
}

function AccesoRapido({ label, icon: Icon, href, disabled }: AccesoRapidoProps) {
  const base =
    'flex flex-col items-center gap-2 rounded-xl border p-4 text-center text-xs font-medium transition-all duration-200'
  if (disabled) {
    return (
      <div className={`${base} border-[#1a2e2b] bg-[#0a1a17] text-[#4a6660] opacity-50 cursor-not-allowed`}>
        <Icon size={20} />
        <span>{label}</span>
        <span className="text-[10px] text-[#4a6660]">Próximamente</span>
      </div>
    )
  }
  return (
    <Link
      href={href!}
      className={`${base} border-[#1e3a34] bg-[#0d1f1c] text-[#a8c4be] hover:border-[#337BD9] hover:bg-[#0f2a26] hover:text-white`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  )
}

// ── Bar Chart (CSS puro) ─────────────────────
function BarChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data)
  const max = Math.max(...entries.map(([, v]) => v), 1)
  return (
    <div className="space-y-3">
      {entries.map(([estado, count]) => {
        const pct = Math.max(Math.round((count / max) * 100), count > 0 ? 4 : 0)
        const color = ESTADO_COLORS[estado] ?? '#337BD9'
        const label = ESTADO_LABELS[estado] ?? estado
        return (
          <div key={estado} className="flex items-center gap-3">
            <span className="w-28 text-xs text-[#8aa8a0] shrink-0 text-right">{label}</span>
            <div className="flex-1 h-6 rounded bg-[#0a1a17] overflow-hidden">
              <div
                className="h-full rounded flex items-center justify-end pr-2 transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: color }}
              >
                {count > 0 && (
                  <span className="text-[10px] font-bold text-white">{count}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Line Chart (SVG) ─────────────────────────
function LineChart({ data }: { data: { fecha: string; enviadas: number; creadas: number }[] }) {
  const W = 560
  const H = 140
  const PAD = { top: 12, right: 16, bottom: 30, left: 32 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom

  const maxVal = Math.max(...data.map((d) => Math.max(d.enviadas, d.creadas)), 1)
  const N = data.length

  function xPos(i: number) {
    return PAD.left + (i / Math.max(N - 1, 1)) * iW
  }
  function yPos(v: number) {
    return PAD.top + iH - (v / maxVal) * iH
  }

  const envPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i).toFixed(1)},${yPos(d.enviadas).toFixed(1)}`).join(' ')
  const creaPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i).toFixed(1)},${yPos(d.creadas).toFixed(1)}`).join(' ')
  const tickIndices = data.map((_, i) => i).filter((i) => i % 2 === 0)

  return (
    <div className="overflow-x-auto">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="min-w-[300px]">
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = PAD.top + iH - frac * iH
          return (
            <line key={frac} x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
              stroke="#1e3a34" strokeWidth="1" />
          )
        })}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + iH} stroke="#2d4e48" strokeWidth="1" />
        <line x1={PAD.left} y1={PAD.top + iH} x2={W - PAD.right} y2={PAD.top + iH} stroke="#2d4e48" strokeWidth="1" />
        <path d={creaPath} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={envPath} fill="none" stroke="#337BD9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xPos(i)} cy={yPos(d.creadas)} r="3" fill="#22c55e" />
            <circle cx={xPos(i)} cy={yPos(d.enviadas)} r="3" fill="#337BD9" />
          </g>
        ))}
        {tickIndices.map((i) => (
          <text key={i} x={xPos(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#6b9b92">
            {data[i].fecha}
          </text>
        ))}
        <text x={PAD.left - 4} y={PAD.top + 4} textAnchor="end" fontSize="9" fill="#6b9b92">{maxVal}</text>
        <text x={PAD.left - 4} y={PAD.top + iH} textAnchor="end" fontSize="9" fill="#6b9b92">0</text>
      </svg>
      <div className="flex gap-4 mt-1 justify-end text-xs text-[#8aa8a0]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 bg-[#22c55e] rounded" /> Creadas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 bg-[#337BD9] rounded" /> Enviadas
        </span>
      </div>
    </div>
  )
}

// ── Skeleton ─────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#1e3a34] rounded ${className ?? ''}`} />
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────
export function DashboardHome() {
  const { session, token, hasRole } = useAuth()
  const [data, setData] = useState<DashboardGlobal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !hasRole('ADMIN')) return
    setLoading(true)
    getDashboardGlobal(token)
      .then(setData)
      .catch((e: Error) => setError(e.message ?? 'Error al cargar el dashboard'))
      .finally(() => setLoading(false))
  }, [token])

  // ── ADMIN ────────────────────────────────
  if (hasRole('ADMIN')) {
    return (
      <div className="space-y-8">

        {/* Cabecera */}
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-[#8aa8a0]">
            Resumen general de la plataforma · {session?.email}
          </p>
        </div>

        {/* ── KPIs ── */}
        <section>
          {error && (
            <div className="mb-4 rounded-xl border border-red-900 bg-red-900/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              [0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-[#1e3a34] bg-[#0d1f1c] p-5 space-y-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-2 w-32" />
                </div>
              ))
            ) : (
              <>
                <KpiCard
                  title="Convocatorias activas"
                  value={data?.convocatoriasActivas ?? 0}
                  subtitle="Estado PUBLICADA"
                  icon={FileText}
                  iconColor="text-blue-400"
                />
                <KpiCard
                  title="Total postulaciones"
                  value={data?.totalPostulaciones ?? 0}
                  subtitle="Todas las convocatorias"
                  icon={ClipboardList}
                  iconColor="text-green-400"
                />
                <KpiCard
                  title="Revisores asignados"
                  value={data?.revisoresAsignados ?? 0}
                  subtitle="Usuarios con rol REVISOR"
                  icon={Users}
                  iconColor="text-purple-400"
                />
                <KpiCard
                  title="Seleccionados"
                  value={
                    data
                      ? `${data.seleccionados} (${data.seleccionadosPorcentaje}%)`
                      : '0 (0%)'
                  }
                  subtitle="Del total de postulaciones"
                  icon={Trophy}
                  iconColor="text-amber-400"
                />
              </>
            )}
          </div>
        </section>

        {/* ── Accesos rápidos ── */}
        <section>
          <h2 className="text-base font-semibold text-white mb-4">Accesos rápidos</h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
            <AccesoRapido label="Constructor de Etapas"    icon={Layers}       href="/dashboard/convocatorias" />
            <AccesoRapido label="Criterios de Evaluación"  icon={CheckSquare}  href="/dashboard/convocatorias" />
            <AccesoRapido label="Asignar Revisores"        icon={UserCheck}    href="/dashboard/usuarios" />
            <AccesoRapido label="Selección de Ganadores"   icon={Star}         href="/dashboard/convocatorias" />
            <AccesoRapido label="Analytics Avanzado"       icon={BarChart2}    disabled />
            <AccesoRapido label="Mensajería Masiva"        icon={MessageSquare} disabled />
            <AccesoRapido label="Respaldos / Exportación"  icon={Archive}      disabled />
            <AccesoRapido label="Configuración Plataforma" icon={Settings}     disabled />
          </div>
        </section>

        {/* ── Gráficos ── */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Bar chart */}
          <div className="rounded-xl border border-[#1e3a34] bg-[#0d1f1c] p-5">
            <h3 className="text-sm font-semibold text-white mb-5">Postulaciones por estado</h3>
            {loading ? (
              <div className="space-y-3">
                {[80, 100, 60, 40, 30].map((w, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-3 w-24 shrink-0" />
                    <Skeleton className={`h-6 w-[${w}%]`} style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
            ) : data && Object.keys(data.postulacionesPorEstado).length > 0 ? (
              <BarChart data={data.postulacionesPorEstado} />
            ) : (
              <p className="text-sm text-[#4a6660] text-center py-8">Sin datos disponibles</p>
            )}
          </div>

          {/* Line chart */}
          <div className="rounded-xl border border-[#1e3a34] bg-[#0d1f1c] p-5">
            <h3 className="text-sm font-semibold text-white mb-5">
              Evolución temporal{' '}
              <span className="text-[#4a6660] text-xs font-normal">(últimos 14 días)</span>
            </h3>
            {loading ? (
              <Skeleton className="h-36 w-full" />
            ) : data && data.evolucionTemporal.length > 0 ? (
              <LineChart data={data.evolucionTemporal} />
            ) : (
              <p className="text-sm text-[#4a6660] text-center py-8">Sin datos disponibles</p>
            )}
          </div>
        </section>

        {/* ── Últimas postulaciones ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Últimas postulaciones</h2>
            <Link href="/dashboard/convocatorias" className="text-xs text-[#337BD9] hover:underline">
              Ver todo →
            </Link>
          </div>

          <div className="rounded-xl border border-[#1e3a34] bg-[#0d1f1c] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-4 px-4 py-2 text-xs font-medium text-[#4a6660] uppercase tracking-wide border-b border-[#1e3a34]">
              <span>Postulante</span>
              <span>Convocatoria</span>
              <span className="hidden sm:block">Fecha</span>
              <span>Estado</span>
            </div>

            {loading ? (
              <div className="divide-y divide-[#1e3a34]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4">
                    <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-2 w-48" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : data && data.ultimasPostulaciones.length > 0 ? (
              <div className="divide-y divide-[#1e3a34]">
                {data.ultimasPostulaciones.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-4 items-center px-4 py-3 hover:bg-[#0f2a26] transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#337BD9]/20 text-[#337BD9] flex items-center justify-center text-sm font-bold shrink-0">
                        {getInitial(p.postulanteNombre)}
                      </div>
                      <span className="text-sm text-[#a8c4be] truncate">{p.postulanteNombre}</span>
                    </div>
                    <span className="text-sm text-[#8aa8a0] truncate">{p.convocatoriaTitulo}</span>
                    <span className="hidden sm:flex items-center gap-1 text-xs text-[#4a6660] whitespace-nowrap">
                      <Clock size={11} />
                      {formatFecha(p.fecha)}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${ESTADO_BADGE[p.estado] ?? 'bg-gray-700 text-gray-300'}`}>
                      {ESTADO_LABELS[p.estado] ?? p.estado}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#4a6660] text-center py-8">No hay postulaciones aún</p>
            )}
          </div>
        </section>

      </div>
    )
  }

  // ── POSTULANTE ───────────────────────────
  if (hasRole('POSTULANTE')) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis postulaciones</h1>
          <p className="mt-1 text-sm text-[#8aa8a0]">{session?.email}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/mis-postulaciones" className="flex items-center gap-3 rounded-xl border border-[#1e3a34] bg-[#0d1f1c] p-5 hover:border-[#337BD9] transition-colors">
            <div className="p-2 rounded-lg bg-[#132d28] text-blue-400"><ClipboardList size={20} /></div>
            <div>
              <p className="text-sm font-semibold text-white">Mis postulaciones</p>
              <p className="text-xs text-[#8aa8a0]">Revisa el estado de tus postulaciones</p>
            </div>
          </Link>
          <Link href="/convocatorias" className="flex items-center gap-3 rounded-xl border border-[#1e3a34] bg-[#0d1f1c] p-5 hover:border-[#337BD9] transition-colors">
            <div className="p-2 rounded-lg bg-[#132d28] text-green-400"><FileText size={20} /></div>
            <div>
              <p className="text-sm font-semibold text-white">Explorar convocatorias</p>
              <p className="text-xs text-[#8aa8a0]">Descubre convocatorias abiertas</p>
            </div>
          </Link>
        </div>
      </div>
    )
  }

  // ── REVISOR ──────────────────────────────
  if (hasRole('REVISOR')) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Evaluaciones</h1>
          <p className="mt-1 text-sm text-[#8aa8a0]">{session?.email}</p>
        </div>
        <Link href="/evaluaciones" className="flex items-center gap-3 rounded-xl border border-[#1e3a34] bg-[#0d1f1c] p-5 hover:border-[#337BD9] transition-colors w-fit">
          <div className="p-2 rounded-lg bg-[#132d28] text-amber-400"><Star size={20} /></div>
          <div>
            <p className="text-sm font-semibold text-white">Mis evaluaciones</p>
            <p className="text-xs text-[#8aa8a0]">Postulaciones pendientes de evaluar</p>
          </div>
        </Link>
      </div>
    )
  }

  return null
}
