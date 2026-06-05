'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { enviarMensajeMasivo } from '@/lib/api/notificaciones'
import { MessageSquare, Send, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const DESTINATARIOS = [
  { value: 'TODOS', label: 'Todos los usuarios', desc: 'Postulantes y revisores' },
  { value: 'POSTULANTE', label: 'Solo postulantes', desc: 'Usuarios con rol POSTULANTE' },
  { value: 'REVISOR', label: 'Solo revisores', desc: 'Usuarios con rol REVISOR' },
] as const

export default function MensajeriaPage() {
  const { token } = useAuth()
  const [dest, setDest] = useState<'TODOS'|'POSTULANTE'|'REVISOR'>('TODOS')
  const [titulo, setTitulo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{total:number;mensaje:string}|null>(null)
  const [error, setError] = useState<string|null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setLoading(true); setError(null); setResult(null)
    try {
      const r = await enviarMensajeMasivo({ destinatarios: dest, titulo, mensaje }, token)
      setResult(r)
      setTitulo(''); setMensaje('')
    } catch(err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensajes')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#132d28] text-purple-400"><MessageSquare size={22} /></div>
        <div>
          <h1 className="text-2xl font-bold text-white">Mensajería Masiva</h1>
          <p className="text-sm text-[#8aa8a0]">Envía notificaciones internas a grupos de usuarios</p>
        </div>
      </div>

      {result && (
        <div className="flex items-center gap-3 rounded-xl border border-green-900 bg-green-900/10 p-4">
          <CheckCircle size={18} className="text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-300">{result.mensaje}</p>
            <p className="text-xs text-[#8aa8a0]">Se notificó a <strong className="text-white">{result.total}</strong> usuario{result.total !== 1 ? 's' : ''}.</p>
          </div>
        </div>
      )}
      {error && <div className="rounded-xl border border-red-900 bg-red-900/10 p-4 text-sm text-red-400">{error}</div>}

      <form onSubmit={handleSubmit} className="rounded-xl border border-[#1e3a34] bg-[#0d1f1c] p-6 space-y-6">
        {/* Destinatarios */}
        <div>
          <label className="block text-sm font-medium text-white mb-3">Destinatarios</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {DESTINATARIOS.map(d => (
              <button key={d.value} type="button" onClick={() => setDest(d.value)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  dest === d.value
                    ? 'border-[#337BD9] bg-[#337BD9]/10'
                    : 'border-[#1e3a34] bg-[#0a1a17] hover:border-[#2a4a44]'
                }`}>
                <p className="text-sm font-medium text-white">{d.label}</p>
                <p className="text-xs text-[#8aa8a0] mt-0.5">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Asunto */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Asunto</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} required maxLength={120}
            placeholder="Ej: Recordatorio — plazo cierra el viernes"
            className="w-full rounded-lg border border-[#1e3a34] bg-[#0a1a17] px-4 py-2.5 text-sm text-white placeholder-[#4a6660] focus:border-[#337BD9] focus:outline-none" />
        </div>

        {/* Mensaje */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Mensaje</label>
          <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} required rows={5} maxLength={1000}
            placeholder="Escribe el contenido del mensaje…"
            className="w-full rounded-lg border border-[#1e3a34] bg-[#0a1a17] px-4 py-2.5 text-sm text-white placeholder-[#4a6660] focus:border-[#337BD9] focus:outline-none resize-none" />
          <p className="text-xs text-[#4a6660] mt-1 text-right">{mensaje.length}/1000</p>
        </div>

        <button type="submit" disabled={loading || !titulo.trim() || !mensaje.trim()}
          className="flex items-center gap-2 rounded-lg bg-[#337BD9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2a6bc4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <Send size={15} /> {loading ? 'Enviando…' : 'Enviar notificación'}
        </button>
      </form>

      <div className="rounded-xl border border-[#1e3a34] bg-[#0d1f1c] p-4">
        <p className="text-xs font-semibold text-[#8aa8a0] mb-2">ℹ️ Sobre este módulo</p>
        <p className="text-xs text-[#4a6660] leading-relaxed">
          Los mensajes se envían como notificaciones internas a los usuarios seleccionados. 
          Cada usuario verá el mensaje en el ícono de campana de la plataforma. 
          Para mensajería por correo electrónico externo configure el servicio SMTP en la sección de Configuración.
        </p>
      </div>

      <div className="flex">
        <Link href="/dashboard" className="text-xs text-[#8aa8a0] hover:text-white">← Volver al Dashboard</Link>
      </div>
    </div>
  )
}
