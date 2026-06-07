'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Settings, Save, CheckCircle, Loader2, Building2, ImagePlus, Trash2, Palette, Link2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getTokenClient } from '@/lib/auth'
import { getConfiguracion, updateConfiguracion } from '@/lib/api/configuracion'
import { getInstitucion, updateInstitucion } from '@/lib/api/instituciones'
import { toast } from '@/hooks/useToast'
import type { Institucion } from '@/lib/types'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PlatformConfig {
  nombrePlataforma: string
  descripcionInicio: string
  registroAbierto: boolean
  terminosCondiciones: string
  limiteIntentos: number
  remitentEmail: string
  mensajeBienvenida: string
  colorPrimario: string
  colorSecundario: string
  colorFondo: string
  colorTexto: string
}

const DEFAULT_CONFIG: PlatformConfig = {
  nombrePlataforma: 'Hub Convocatorias',
  descripcionInicio: 'Plataforma de gestión integral de convocatorias.',
  registroAbierto: true,
  terminosCondiciones: '',
  limiteIntentos: 5,
  remitentEmail: 'no-reply@vantix.cl',
  mensajeBienvenida: 'Bienvenido/a a Hub Convocatorias.',
  colorPrimario: '#337BD9',
  colorSecundario: '#22c55e',
  colorFondo: '#08100E',
  colorTexto: '#ffffff',
}

function mapApiToConfig(v: Record<string, string>): PlatformConfig {
  return {
    nombrePlataforma:   v.nombrePlataforma   ?? DEFAULT_CONFIG.nombrePlataforma,
    descripcionInicio:  v.descripcionInicio  ?? DEFAULT_CONFIG.descripcionInicio,
    registroAbierto:    (v.registroAbierto   ?? 'true') === 'true',
    terminosCondiciones: v.terminosCondiciones ?? '',
    limiteIntentos:     Number(v.limiteIntentos ?? '5'),
    remitentEmail:      v.remitentEmail       ?? DEFAULT_CONFIG.remitentEmail,
    mensajeBienvenida:  v.mensajeBienvenida   ?? DEFAULT_CONFIG.mensajeBienvenida,
    colorPrimario:      v.colorPrimario       ?? DEFAULT_CONFIG.colorPrimario,
    colorSecundario:    v.colorSecundario     ?? DEFAULT_CONFIG.colorSecundario,
    colorFondo:         v.colorFondo          ?? DEFAULT_CONFIG.colorFondo,
    colorTexto:         v.colorTexto          ?? DEFAULT_CONFIG.colorTexto,
  }
}

function mapConfigToApi(cfg: PlatformConfig): Record<string, string> {
  return {
    nombrePlataforma: cfg.nombrePlataforma,
    descripcionInicio: cfg.descripcionInicio,
    registroAbierto: String(cfg.registroAbierto),
    terminosCondiciones: cfg.terminosCondiciones,
    limiteIntentos: String(cfg.limiteIntentos),
    remitentEmail: cfg.remitentEmail,
    mensajeBienvenida: cfg.mensajeBienvenida,
    colorPrimario: cfg.colorPrimario,
    colorSecundario: cfg.colorSecundario,
    colorFondo: cfg.colorFondo,
    colorTexto: cfg.colorTexto,
  }
}

// ─── Helpers UI ──────────────────────────────────────────────────────────────

const inputCls = "w-full rounded-lg border border-[#1e3a34] bg-[#0a1a17] px-4 py-2.5 text-sm text-white placeholder-[#4a6660] focus:border-[#337BD9] focus:outline-none"

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

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-[#a8c4be]">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-[#1e3a34] bg-transparent p-0.5" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-[#1e3a34] bg-[#0a1a17] px-3 py-2 text-sm text-white font-mono focus:border-[#337BD9] focus:outline-none"
          placeholder="#000000" maxLength={7} />
        <div className="h-10 w-10 rounded-lg border border-[#1e3a34] shrink-0" style={{ backgroundColor: value }} />
      </div>
    </div>
  )
}

// ─── Logo uploader inline ─────────────────────────────────────────────────────

const IMG_MAX_MB = 2
const IMG_TYPES  = ['image/png','image/jpeg','image/webp','image/svg+xml']

function LogoSection({ logoUrl, onLogoChange }: { logoUrl?: string; onLogoChange: (b64: string | undefined) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function processFile(file: File) {
    if (!IMG_TYPES.includes(file.type)) {
      toast({ title: 'Formato no permitido', description: 'PNG, JPG, WEBP o SVG', variant: 'destructive' }); return
    }
    if (file.size > IMG_MAX_MB * 1024 * 1024) {
      toast({ title: `Imagen supera ${IMG_MAX_MB} MB`, variant: 'destructive' }); return
    }
    const reader = new FileReader()
    reader.onload = () => onLogoChange(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-start gap-5">
      {logoUrl ? (
        <div className="relative group shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt="Logo" className="h-20 w-20 rounded-xl object-contain border border-[#1e3a34] bg-[#0a1a17] p-1" />
          <div className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20">
              <ImagePlus size={13}/>
            </button>
            <button type="button" onClick={() => onLogoChange(undefined)}
              className="rounded-lg bg-red-500/20 p-1.5 text-red-300 hover:bg-red-500/30">
              <Trash2 size={13}/>
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#1e3a34] bg-[#0a1a17] text-[#4a6660] hover:border-[#337BD9] hover:text-[#337BD9] transition-colors">
          <ImagePlus size={20}/>
          <span className="text-[10px]">Logo</span>
        </button>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium text-[#a8c4be]">Logo de la institución</p>
        <p className="text-xs text-[#4a6660]">PNG, JPG, WEBP, SVG · máx. {IMG_MAX_MB} MB</p>
        <p className="text-xs text-[#4a6660]">Aparece en el perfil público de tu institución.</p>
        <button type="button" onClick={() => inputRef.current?.click()}
          className="text-xs text-[#337BD9] hover:underline mt-1">
          {logoUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
        </button>
      </div>
      <input ref={inputRef} type="file" className="hidden" accept={IMG_TYPES.join(',')}
        onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = '' }} />
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ConfiguracionPage() {
  const { session } = useAuth()
  const [cfg, setCfg]       = useState<PlatformConfig>(DEFAULT_CONFIG)
  const [inst, setInst]     = useState<Institucion | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [instId, setInstId]   = useState<number | null>(null)

  const loadAll = useCallback(async () => {
    const id = session?.institucionId
    if (!id) { setLoading(false); return }
    setInstId(id)
    const token = getTokenClient() ?? ''
    try {
      const [confData, instData] = await Promise.all([
        getConfiguracion(id, token),
        getInstitucion(id, token),
      ])
      setCfg(mapApiToConfig(confData.valores))
      setInst(instData)
      setLogoUrl(instData.logoUrl ?? undefined)
    } catch {
      toast({ title: 'Error al cargar configuración', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => { loadAll() }, [loadAll])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!instId) return
    setSaving(true)
    try {
      const token = getTokenClient() ?? ''
      // 1. Guardar config (colores + texto)
      await updateConfiguracion(instId, mapConfigToApi(cfg), token)
      // 2. Guardar logo en institución si cambió
      if (inst) {
        await updateInstitucion(instId, {
          nombre:    inst.nombre,
          rut:       inst.rut,
          direccion: inst.direccion,
          telefono:  inst.telefono,
          email:     inst.email,
          logoUrl:   logoUrl,
        }, token)
      }
      setSaved(true); setTimeout(() => setSaved(false), 3000)
      toast({ title: 'Configuración guardada exitosamente', variant: 'success' })
    } catch {
      toast({ title: 'Error al guardar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  function set<K extends keyof PlatformConfig>(key: K, val: PlatformConfig[K]) {
    setCfg(p => ({ ...p, [key]: val }))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="animate-spin text-[#337BD9]" size={32}/>
    </div>
  )

  if (!session?.institucionId) return (
    <div className="rounded-xl border border-amber-900/40 bg-amber-900/10 p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-2">
        <Building2 className="text-amber-400" size={20}/>
        <h2 className="text-sm font-semibold text-amber-400">Sin institución asociada</h2>
      </div>
      <p className="text-xs text-amber-300">Contacta a un administrador para que te asigne una institución.</p>
    </div>
  )

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#132d28] text-[#337BD9]"><Settings size={22}/></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Configuración</h1>
            <p className="text-sm text-[#8aa8a0]">Configuración persistida en base de datos por institución</p>
          </div>
        </div>
        {saved && <div className="flex items-center gap-2 text-sm text-green-400"><CheckCircle size={16}/> Guardado</div>}
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* ── Logo ── */}
        <Section title="🏢 Logo de la institución">
          <LogoSection logoUrl={logoUrl} onLogoChange={setLogoUrl}/>
          {inst?.slug && (
            <div className="flex items-center gap-2 rounded-lg border border-[#1e3a34] bg-[#0a1a17] px-4 py-2.5">
              <Link2 size={14} className="text-[#337BD9] shrink-0"/>
              <span className="text-xs text-[#8aa8a0]">URL pública:</span>
              <span className="text-xs text-[#337BD9] font-mono">/{inst.slug}</span>
            </div>
          )}
        </Section>

        {/* ── Colores ── */}
        <Section title="🎨 Paleta de colores de la institución">
          <p className="text-xs text-[#8aa8a0] -mt-2">
            Estos colores se aplican en el perfil público de tu institución (/{inst?.slug ?? 'slug'}).
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <ColorField label="Color primario" value={cfg.colorPrimario} onChange={v => set('colorPrimario', v)}/>
            <ColorField label="Color secundario" value={cfg.colorSecundario} onChange={v => set('colorSecundario', v)}/>
            <ColorField label="Color de fondo" value={cfg.colorFondo} onChange={v => set('colorFondo', v)}/>
            <ColorField label="Color de texto" value={cfg.colorTexto} onChange={v => set('colorTexto', v)}/>
          </div>
          {/* Preview */}
          <div className="rounded-xl p-5 mt-2 transition-all" style={{ backgroundColor: cfg.colorFondo, border: `2px solid ${cfg.colorPrimario}` }}>
            <div className="flex items-center gap-3 mb-3">
              {logoUrl
                ? <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded-lg object-contain bg-white/10 p-0.5"/> /* eslint-disable-line @next/next/no-img-element */
                : <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg.colorPrimario + '33' }}>
                    <Building2 size={18} style={{ color: cfg.colorPrimario }}/>
                  </div>
              }
              <div>
                <p className="text-sm font-bold" style={{ color: cfg.colorTexto }}>
                  {inst?.nombre ?? 'Mi Institución'}
                </p>
                <p className="text-xs" style={{ color: cfg.colorTexto + 'aa' }}>
                  {cfg.descripcionInicio}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: cfg.colorPrimario, color: '#fff' }}>
                Iniciar sesión
              </div>
              <div className="px-4 py-1.5 rounded-lg text-xs font-semibold border" style={{ borderColor: cfg.colorPrimario, color: cfg.colorPrimario }}>
                Registrarse
              </div>
            </div>
          </div>
        </Section>

        {/* ── Identidad ── */}
        <Section title="🏠 Identidad de la plataforma">
          <Field label="Nombre de la plataforma" hint="Aparece en el título del navegador">
            <input value={cfg.nombrePlataforma} onChange={e => set('nombrePlataforma', e.target.value)} className={inputCls}/>
          </Field>
          <Field label="Descripción de inicio" hint="Subtítulo en la bienvenida">
            <input value={cfg.descripcionInicio} onChange={e => set('descripcionInicio', e.target.value)} className={inputCls}/>
          </Field>
          <Field label="Mensaje de bienvenida a postulantes">
            <textarea value={cfg.mensajeBienvenida} onChange={e => set('mensajeBienvenida', e.target.value)}
              rows={3} className={`${inputCls} resize-none`}/>
          </Field>
        </Section>

        {/* ── Seguridad ── */}
        <Section title="🔒 Acceso y Seguridad">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Registro de postulantes">
              <div className="flex flex-col gap-2 mt-1">
                {[{val:true,label:'Abierto',desc:'Cualquiera puede registrarse'},{val:false,label:'Por invitación',desc:'Solo usuarios invitados'}].map(opt=>(
                  <button key={String(opt.val)} type="button" onClick={()=>set('registroAbierto',opt.val)}
                    className={`text-left rounded-lg border p-3 transition-colors ${cfg.registroAbierto===opt.val?'border-[#337BD9] bg-[#337BD9]/10':'border-[#1e3a34] bg-[#0a1a17] hover:border-[#2a4a44]'}`}>
                    <p className="text-sm font-medium text-white">{opt.label}</p>
                    <p className="text-xs text-[#8aa8a0]">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Intentos fallidos de contraseña" hint="Bloquea tras este número de intentos">
              <select value={cfg.limiteIntentos} onChange={e=>set('limiteIntentos',Number(e.target.value))} className={inputCls}>
                {[3,5,10].map(n=><option key={n} value={n}>{n} intentos</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* ── Email ── */}
        <Section title="📧 Correo">
          <Field label="Correo remitente" hint="Desde el cual se envían notificaciones automáticas">
            <input type="email" value={cfg.remitentEmail} onChange={e=>set('remitentEmail',e.target.value)} className={inputCls}/>
          </Field>
        </Section>

        {/* ── Términos ── */}
        <Section title="📋 Términos y Condiciones">
          <Field label="Texto de términos y condiciones" hint="Vacío = no se muestran">
            <textarea value={cfg.terminosCondiciones} onChange={e=>set('terminosCondiciones',e.target.value)}
              rows={5} placeholder="Escribe los términos de uso…" className={`${inputCls} resize-none`}/>
          </Field>
        </Section>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-[#337BD9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2a6bc4] disabled:opacity-60 transition-colors">
            {saving?<Loader2 size={15} className="animate-spin"/>:<Save size={15}/>}
            {saving?'Guardando…':'Guardar configuración'}
          </button>
          <button type="button" onClick={()=>setCfg(DEFAULT_CONFIG)}
            className="rounded-lg border border-[#1e3a34] px-5 py-2.5 text-sm font-medium text-[#8aa8a0] hover:text-white hover:border-[#337BD9] transition-colors">
            Restablecer colores
          </button>
        </div>
      </form>

      <div className="flex">
        <Link href="/dashboard" className="text-xs text-[#8aa8a0] hover:text-white">← Volver al Dashboard</Link>
      </div>
    </div>
  )
}
