'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getTodasConvocatorias } from '@/lib/api/convocatorias'
import { getDashboardGlobal } from '@/lib/api/dashboard'
import type { Convocatoria, DashboardGlobal } from '@/lib/types'
import { Archive, Download, FileText, Table } from 'lucide-react'
import Link from 'next/link'

function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    const s = String(v ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g,'""')}"` : s
  }
  return [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n')
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function RespaldosPage() {
  const { token } = useAuth()
  const [convs, setConvs] = useState<Convocatoria[]>([])
  const [stats, setStats] = useState<DashboardGlobal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    Promise.all([getTodasConvocatorias(token), getDashboardGlobal(token)])
      .then(([c, s]) => { setConvs(c); setStats(s) })
      .finally(() => setLoading(false))
  }, [token])

  function exportConvocatoriasCSV() {
    const rows = convs.map(c => ({
      ID: c.id, Título: c.titulo, Organización: c.organizacion ?? '',
      Estado: c.estado, Descripción: (c.descripcion ?? '').replace(/\n/g,' ')
    }))
    downloadCSV(toCSV(rows), `convocatorias_${new Date().toISOString().slice(0,10)}.csv`)
  }

  function exportStatsCSV() {
    if (!stats) return
    const rows = Object.entries(stats.postulacionesPorEstado).map(([estado, total]) => ({ Estado: estado, Total: total }))
    downloadCSV(toCSV(rows), `estadisticas_postulaciones_${new Date().toISOString().slice(0,10)}.csv`)
  }

  function exportDashboardJSON() {
    if (!stats) return
    downloadJSON(stats, `dashboard_global_${new Date().toISOString().slice(0,10)}.json`)
  }

  function exportUltimasCSV() {
    if (!stats?.ultimasPostulaciones.length) return
    const rows = stats.ultimasPostulaciones.map(p => ({
      ID: p.id, Postulante: p.postulanteNombre, Convocatoria: p.convocatoriaTitulo,
      Fecha: p.fecha, Estado: p.estado
    }))
    downloadCSV(toCSV(rows), `ultimas_postulaciones_${new Date().toISOString().slice(0,10)}.csv`)
  }

  const ExportCard = ({ title, desc, icon: Icon, onExport, disabled }: {
    title: string; desc: string; icon: React.ElementType;
    onExport: () => void; disabled?: boolean
  }) => (
    <div className="rounded-xl border border-[#1e3a34] bg-[#0d1f1c] p-5 flex items-start gap-4">
      <div className="p-2 rounded-lg bg-[#132d28] text-[#337BD9] shrink-0"><Icon size={20} /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-[#8aa8a0] mt-1">{desc}</p>
      </div>
      <button onClick={onExport} disabled={disabled || loading}
        className="flex items-center gap-1.5 rounded-lg bg-[#132d28] border border-[#1e3a34] px-3 py-2 text-xs font-medium text-[#337BD9] hover:bg-[#1e3a34] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0">
        <Download size={13} /> Exportar
      </button>
    </div>
  )

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#132d28] text-amber-400"><Archive size={22} /></div>
        <div>
          <h1 className="text-2xl font-bold text-white">Respaldos y Exportación</h1>
          <p className="text-sm text-[#8aa8a0]">Descarga consolidada de datos de la plataforma</p>
        </div>
      </div>

      {loading && <div className="h-40 bg-[#1e3a34] rounded animate-pulse" />}

      {!loading && (
        <>
          <section>
            <h2 className="text-sm font-semibold text-[#8aa8a0] uppercase tracking-wide mb-3">Convocatorias</h2>
            <div className="space-y-3">
              <ExportCard title="Convocatorias — CSV" desc={`${convs.length} convocatorias (ID, Título, Organización, Estado)`}
                icon={FileText} onExport={exportConvocatoriasCSV} disabled={!convs.length} />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-[#8aa8a0] uppercase tracking-wide mb-3">Estadísticas de Postulaciones</h2>
            <div className="space-y-3">
              <ExportCard title="Distribución por estado — CSV" desc="Total de postulaciones agrupadas por estado"
                icon={Table} onExport={exportStatsCSV} disabled={!stats} />
              <ExportCard title="Últimas postulaciones — CSV"
                desc={`${stats?.ultimasPostulaciones.length ?? 0} postulaciones recientes (Postulante, Convocatoria, Fecha, Estado)`}
                icon={Table} onExport={exportUltimasCSV} disabled={!stats?.ultimasPostulaciones.length} />
              <ExportCard title="Dashboard global — JSON" desc="Exporta todos los datos del dashboard en formato JSON estructurado"
                icon={Archive} onExport={exportDashboardJSON} disabled={!stats} />
            </div>
          </section>

          <div className="rounded-xl border border-amber-900/40 bg-amber-900/10 p-4">
            <p className="text-xs font-semibold text-amber-400 mb-1">⚠️ Próximas funcionalidades</p>
            <ul className="text-xs text-[#8aa8a0] space-y-1 list-disc list-inside">
              <li>Descarga ZIP por convocatoria (PDF resumen + adjuntos de cada postulación)</li>
              <li>Excel consolidado con todas las evaluaciones de revisores</li>
              <li>Respaldo automático programado con envío por correo</li>
            </ul>
          </div>
        </>
      )}

      <div className="flex">
        <Link href="/dashboard" className="text-xs text-[#8aa8a0] hover:text-white">← Volver al Dashboard</Link>
      </div>
    </div>
  )
}
