'use client'
import { useState, useEffect } from 'react'
import { Settings, Save, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const STORAGE_KEY = 'hub_platform_config'

interface PlatformConfig {
  nombrePlataforma: string
  descripcionInicio: string
  registroAbierto: boolean
  requiereInvitacion: boolean
  terminosCondiciones: string
  limiteIntentos: number
  remitentEmail: string
  mensajeBienvenida: string
}

const DEFAULT_CONFIG: PlatformConfig = {
  nombrePlataforma: 'Hub Convocatorias',
  descripcionInicio: 'Plataforma de gestión integral de inscripción y convocatorias de emprendimiento.',
  registroAbierto: true,
  requiereInvitacion: false,
  terminosCondiciones: '',
  limiteIntentos: 5,
  remitentEmail: 'no-reply@vantix.cl',
  mensajeBienvenida: 'Bienvenido/a a Hub Convocatorias. Aquí podrás postular a todas las convocatorias disponibles.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#1e3a34] bg-[#0d1f1c] p-6 space-y-5">
      <h2 className="text-sm font-semibold text-white border-b border-[#1e3a34] pb-3">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#a8c4be] mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#4a6660] mt-1">{hint}</p>}
    </div>
  )
}

const inputCls = "w-full rounded-lg border border-[#1e3a34] bg-[#0a1a17] px-4 py-2.5 text-sm text-white placeholder-[#4a6660] focus:border-[#337BD9] focus:outline-none"

export default function ConfiguracionPage() {
  const [cfg, setCfg] = useState<PlatformConfig>(DEFAULT_CONFIG)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setCfg({ ...DEFAULT_CONFIG, ...JSON.parse(raw) })
    } catch { /* ignore */ }
  }, [])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function set<K extends keyof PlatformConfig>(key: K, val: PlatformConfig[K]) {
    setCfg(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#132d28] text-[#337BD9]"><Settings size={22} /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Configuración de la Plataforma</h1>
            <p className="text-sm text-[#8aa8a0]">Personaliza el comportamiento y apariencia de la plataforma</p>
          </div>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <CheckCircle size={16} /> Guardado
          </div>
        )}
      </div>

      <div className="rounded-xl border border-amber-900/40 bg-amber-900/10 p-3">
        <p className="text-xs text-amber-400">
          ⚠️ Configuración almacenada localmente en este navegador. En una versión futura estará sincronizada con el servidor.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Section title="🏠 Identidad de la plataforma">
          <Field label="Nombre de la plataforma" hint="Aparece en el título de la pestaña del navegador">
            <input value={cfg.nombrePlataforma} onChange={e => set('nombrePlataforma', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Descripción de inicio" hint="Subtítulo visible en la página de bienvenida">
            <input value={cfg.descripcionInicio} onChange={e => set('descripcionInicio', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Mensaje de bienvenida a postulantes">
            <textarea value={cfg.mensajeBienvenida} onChange={e => set('mensajeBienvenida', e.target.value)}
              rows={3} className={`${inputCls} resize-none`} />
          </Field>
        </Section>

        <Section title="🔒 Acceso y Seguridad">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Registro de postulantes">
              <div className="flex flex-col gap-2 mt-1">
                {[
                  { val: true, label: 'Abierto', desc: 'Cualquiera puede registrarse' },
                  { val: false, label: 'Por invitación', desc: 'Solo usuarios invitados' },
                ].map(opt => (
                  <button key={String(opt.val)} type="button" onClick={() => set('registroAbierto', opt.val)}
                    className={`text-left rounded-lg border p-3 transition-colors ${
                      cfg.registroAbierto === opt.val
                        ? 'border-[#337BD9] bg-[#337BD9]/10'
                        : 'border-[#1e3a34] bg-[#0a1a17] hover:border-[#2a4a44]'
                    }`}>
                    <p className="text-sm font-medium text-white">{opt.label}</p>
                    <p className="text-xs text-[#8aa8a0]">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Intentos de contraseña fallidos" hint="Bloquea la cuenta tras este número de intentos incorrectos">
              <select value={cfg.limiteIntentos} onChange={e => set('limiteIntentos', Number(e.target.value))}
                className={inputCls}>
                {[3,5,10].map(n => <option key={n} value={n}>{n} intentos</option>)}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="📧 Mensajería y Correo">
          <Field label="Correo remitente" hint="Dirección desde la cual se envían las notificaciones automáticas">
            <input type="email" value={cfg.remitentEmail} onChange={e => set('remitentEmail', e.target.value)} className={inputCls} />
          </Field>
        </Section>

        <Section title="📋 Términos y Condiciones">
          <Field label="Texto de términos y condiciones" hint="El usuario debe aceptarlos antes de registrarse. Déjalo vacío para no mostrarlos.">
            <textarea value={cfg.terminosCondiciones} onChange={e => set('terminosCondiciones', e.target.value)}
              rows={6} placeholder="Escribe los términos y condiciones de uso de la plataforma…"
              className={`${inputCls} resize-none`} />
          </Field>
        </Section>

        <div className="flex gap-3">
          <button type="submit"
            className="flex items-center gap-2 rounded-lg bg-[#337BD9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2a6bc4] transition-colors">
            <Save size={15} /> Guardar configuración
          </button>
          <button type="button" onClick={() => { setCfg(DEFAULT_CONFIG); localStorage.removeItem(STORAGE_KEY) }}
            className="rounded-lg border border-[#1e3a34] px-5 py-2.5 text-sm font-medium text-[#8aa8a0] hover:text-white hover:border-[#337BD9] transition-colors">
            Restablecer valores
          </button>
        </div>
      </form>

      <div className="flex">
        <Link href="/dashboard" className="text-xs text-[#8aa8a0] hover:text-white">← Volver al Dashboard</Link>
      </div>
    </div>
  )
}
