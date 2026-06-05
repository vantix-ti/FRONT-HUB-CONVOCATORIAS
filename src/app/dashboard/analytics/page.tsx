'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getDashboardGlobal } from '@/lib/api/dashboard'
import { getTodasConvocatorias } from '@/lib/api/convocatorias'
import type { DashboardGlobal } from '@/lib/types'
import type { Convocatoria } from '@/lib/types'
import { BarChart2, TrendingUp, FileText } from 'lucide-react'
import Link from 'next/link'

const ESTADO_LABELS: Record<string, string> = {
  EN_CREACION: 'En creación', ENVIADA: 'Enviadas',
  EN_EVALUACION: 'En evaluación', SELECCIONADA: 'Seleccionadas',
  NO_SELECCIONADA: 'No selec.',
}
const ESTADO_COLORS: Record<string, string> = {
  EN_CREACION: '#6366f1', ENVIADA: '#337BD9',
  EN_EVALUACION: '#f59e0b', SELECCIONADA: '#22c55e', NO_SELECCIONADA: '#ef4444',
}
const ESTADO_CONV: Record<string, string> = {
  BORRADOR: 'Borrador', PUBLICADA: 'Publicada',
  EVALUACION: 'En evaluación', FINALIZADA: 'Finalizada',
}
const CONV_COLORS: Record<string, string> = {
  BORRADOR: 'bg-gray-500/20 text-gray-300', PUBLICADA: 'bg-green-500/20 text-green-300',
  EVALUACION: 'bg-amber-500/20 text-amber-300', FINALIZADA: 'bg-blue-500/20 text-blue-300',
}

function BarChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data)
  const max = Math.max(...entries.map(([, v]) => v), 1)
  return (
    <div className="space-y-3">
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center gap-3">
          <span className="w-28 text-xs text-[#8aa8a0] shrink-0 text-right">{ESTADO_LABELS[k] ?? k}</span>
          <div className="flex-1 h-6 rounded bg-[#0a1a17] overflow-hidden">
            <div className="h-full rounded flex items-center justify-end pr-2 transition-all duration-700"
              style={{ width: `${Math.max(Math.round((v / max) * 100), v > 0 ? 4 : 0)}%`, backgroundColor: ESTADO_COLORS[k] ?? '#337BD9' }}>
              {v > 0 && <span className="text-[10px] font-bold text-white">{v}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { token } = useAuth()
  const [global, setGlobal] = useState<DashboardGlobal | null>(null)
  const [convs, setConvs] = useState<Convocatoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    Promise.all([
      getDashboardGlobal(token),
      getTodasConvocatorias(token),
    ])
      .then(([g, c]) => { setGlobal(g); setConvs(c) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#132d28] text-[#337BD9]"><BarChart2 size={22} /></div>
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Avanzado</h1>
          <p className="text-sm text-[#8aa8a0]">Estadísticas detalladas de la plataforma</p>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-900 bg-red-900/10 p-4 text-sm text-red-400">{error}</div>}

      {/* KPI resumen */}
      {global && (
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Total postulaciones', value: global.totalPostulaciones, color: 'text-blue-400' },
            { label: 'Activas', value: global.convocatoriasActivas, color: 'text-green-400' },
            { label: 'Seleccionados', value: global.seleccionados, color: 'text-amber-400' },
            { label: '% Selección', value: `${global.seleccionadosPorcentaje}%`, color: 'text-purple-400' },
          ].map(item => (
            <div key={item.label} className="rounded-xl border border-[#1e3a34] bg-[#0d1f1c] p-4">
              <p className="text-xs text-[#8aa8a0]">{item.label}</p>
              <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Distribución por estado */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#1e3a34] bg-[#0d1f1c] p-5">
          <h3 className="text-sm font-semibold text-white mb-5">Distribución por estado de postulación</h3>
          {loading ? <div className="h-40 bg-[#1e3a34] rounded animate-pulse" /> :
            global && Object.keys(global.postulacionesPorEstado).length > 0 ?
              <BarChart data={global.postulacionesPorEstado} /> :
              <p className="text-sm text-[#4a6660] text-center py-8">Sin datos</p>}
        </div>

        {/* Evolución temporal */}
        <div className="rounded-xl border border-[#1e3a34] bg-[#0d1f1c] p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Evolución temporal (últimos 14 días)</h3>
          {loading ? <div className="h-40 bg-[#1e3a34] rounded animate-pulse" /> : global && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-[#8aa8a0]">
                <thead><tr className="border-b border-[#1e3a34]">
                  <th className="text-left py-2 pr-4">Fecha</th>
                  <th className="text-right py-2 pr-4 text-green-400">Creadas</th>
                  <th className="text-right py-2 text-blue-400">Enviadas</th>
                </tr></thead>
                <tbody>
                  {global.evolucionTemporal.filter(p => p.creadas > 0 || p.enviadas > 0).map((p, i) => (
                    <tr key={i} className="border-b border-[#0f2219]">
                      <td className="py-2 pr-4">{p.fecha}</td>
                      <td className="text-right py-2 pr-4 text-green-400">{p.creadas}</td>
                      <td className="text-right py-2 text-blue-400">{p.enviadas}</td>
                    </tr>
                  ))}
                  {global.evolucionTemporal.every(p => p.creadas === 0 && p.enviadas === 0) && (
                    <tr><td colSpan={3} className="text-center py-6 text-[#4a6660]">Sin actividad en los últimos 14 días</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de convocatorias */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <FileText size={16} /> Convocatorias
        </h2>
        <div className="rounded-xl border border-[#1e3a34] bg-[#0d1f1c] overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2 text-xs font-medium text-[#4a6660] uppercase tracking-wide border-b border-[#1e3a34]">
            <span>Título</span><span>Organización</span><span>Estado</span><span className="text-right">Acción</span>
          </div>
          {loading ? (
            [0,1,2].map(i => <div key={i} className="h-12 mx-4 my-2 bg-[#1e3a34] rounded animate-pulse" />)
          ) : convs.length > 0 ? (
            convs.map(c => (
              <div key={c.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-4 py-3 border-b border-[#1e3a34] hover:bg-[#0f2a26]">
                <span className="text-sm text-white truncate">{c.titulo}</span>
                <span className="text-xs text-[#8aa8a0]">{c.organizacion ?? '—'}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CONV_COLORS[c.estado] ?? 'bg-gray-700 text-gray-300'}`}>
                  {ESTADO_CONV[c.estado] ?? c.estado}
                </span>
                <Link href={`/dashboard/convocatorias/${c.id}/etapas`}
                  className="text-xs text-[#337BD9] hover:underline whitespace-nowrap">Ver etapas</Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#4a6660] text-center py-8">No hay convocatorias</p>
          )}
        </div>
      </div>

      <div className="flex">
        <Link href="/dashboard" className="text-xs text-[#8aa8a0] hover:text-white">← Volver al Dashboard</Link>
      </div>
    </div>
  )
}
