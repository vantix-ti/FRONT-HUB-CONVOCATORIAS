"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getTokenClient } from "@/lib/auth";
import { useIsVantixAdmin } from "@/hooks/useIsVantixAdmin";
import { getInstituciones, createInstitucion, updateInstitucion } from "@/lib/api/instituciones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/useToast";
import {
  Building2, Plus, Pencil, ToggleLeft, ToggleRight,
  X, Check, ImagePlus, Trash2,
} from "lucide-react";
import type { Institucion, CreateInstitucionRequest } from "@/lib/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const MAX_SIZE_MB = 2;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.readAsDataURL(file);
  });
}

// ─── Estado vacío ────────────────────────────────────────────────────────────

const EMPTY_FORM: CreateInstitucionRequest = {
  nombre: "", rut: "", direccion: "", telefono: "", email: "", logoUrl: undefined,
};

// ─── Componente de logo ──────────────────────────────────────────────────────

interface LogoUploaderProps {
  value: string | undefined;
  onChange: (b64: string | undefined) => void;
  disabled?: boolean;
}

function LogoUploader({ value, onChange, disabled }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  async function processFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: "Formato no permitido", description: "Usa PNG, JPG, WEBP, GIF o SVG.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({ title: `La imagen supera ${MAX_SIZE_MB} MB`, description: "Reduce el tamaño antes de subir.", variant: "destructive" });
      return;
    }
    try {
      const b64 = await fileToBase64(file);
      onChange(b64);
    } catch {
      toast({ title: "Error al procesar la imagen", variant: "destructive" });
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="space-y-2">
      <Label>Logo de la institución</Label>

      {value ? (
        /* Vista previa */
        <div className="relative w-fit group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Logo"
            className="h-24 w-24 rounded-xl object-contain border border-border bg-background/70 p-1"
          />
          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                title="Cambiar imagen"
                onClick={() => inputRef.current?.click()}
                className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
              >
                <ImagePlus className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Quitar imagen"
                onClick={() => onChange(undefined)}
                className="rounded-lg bg-red-500/20 p-1.5 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Zona de drop */
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
            h-32 w-full cursor-pointer transition-colors select-none
            ${dragging
              ? "border-primary bg-primary/10"
              : "border-border bg-background/50 hover:border-primary/50 hover:bg-primary/5"
            }
            ${disabled ? "cursor-not-allowed opacity-50" : ""}
          `}
        >
          <ImagePlus className={`h-8 w-8 ${dragging ? "text-primary" : "text-text-muted"}`} />
          <p className="text-sm text-text-muted text-center leading-tight px-4">
            {dragging ? "Suelta la imagen aquí" : <>Arrastra o <span className="text-primary underline underline-offset-2">selecciona</span></>}
          </p>
          <p className="text-xs text-text-muted/60">PNG, JPG, WEBP, SVG · máx. {MAX_SIZE_MB} MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        disabled={disabled}
        onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }}
      />
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function InstitucionesPage() {
  const { isVantixAdmin, checking } = useIsVantixAdmin();
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateInstitucionRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cargar = useCallback(async () => {
    const token = getTokenClient();
    if (!token) return;
    setLoading(true);
    try {
      setInstituciones(await getInstituciones(token));
    } catch {
      toast({ title: "Error al cargar instituciones", variant: "destructive" });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  function openCreate() {
    setEditingId(null); setForm(EMPTY_FORM); setErrors({}); setShowForm(true);
  }

  function openEdit(inst: Institucion) {
    setEditingId(inst.id);
    setForm({
      nombre:    inst.nombre    ?? "",
      rut:       inst.rut       ?? "",
      direccion: inst.direccion ?? "",
      telefono:  inst.telefono  ?? "",
      email:     inst.email     ?? "",
      logoUrl:   inst.logoUrl   ?? undefined,
      slug:      inst.slug      ?? '',
    });
    setErrors({}); setShowForm(true);
    setTimeout(() => document.getElementById("inst-form")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function cancelar() {
    setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setErrors({});
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.nombre?.trim()) errs.nombre = "El nombre es requerido";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Formato de correo inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const token = getTokenClient();
    if (!token) return;
    setSaving(true);
    const payload: CreateInstitucionRequest = {
      nombre:    form.nombre?.trim()    || "",
      rut:       form.rut?.trim()       || undefined,
      direccion: form.direccion?.trim() || undefined,
      telefono:  form.telefono?.trim()  || undefined,
      email:     form.email?.trim()     || undefined,
      logoUrl:   form.logoUrl           || undefined,
      slug:      (form.slug as string)?.trim() || undefined,
    };
    try {
      if (editingId !== null) {
        await updateInstitucion(editingId, payload, token);
        toast({ title: "Institución actualizada", variant: "success" });
      } else {
        await createInstitucion(payload, token);
        toast({ title: "Institución creada exitosamente", variant: "success" });
      }
      cancelar(); cargar();
    } catch (err) {
      toast({ title: "Error al guardar", description: String(err), variant: "destructive" });
    } finally { setSaving(false); }
  }

  async function handleToggleActivo(inst: Institucion) {
    const token = getTokenClient();
    if (!token) return;
    try {
      await updateInstitucion(inst.id, { nombre: inst.nombre, activo: !inst.activo }, token);
      toast({ title: inst.activo ? "Institución desactivada" : "Institución activada", variant: "success" });
      cargar();
    } catch {
      toast({ title: "Error al cambiar estado", variant: "destructive" });
    }
  }

  if (!checking && !isVantixAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-text-muted">
        <Building2 className="h-10 w-10 opacity-30" />
        <p className="text-sm">No tienes permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-main">Instituciones</h1>
            <p className="text-sm text-text-muted">
              {instituciones.length} institución{instituciones.length !== 1 ? "es" : ""} registrada{instituciones.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {!showForm && (
          <Button size="sm" className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />Nueva institución
          </Button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div id="inst-form" className="rounded-xl border border-border bg-surface p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-main">
              {editingId !== null ? "Editar institución" : "Nueva institución"}
            </h2>
            <button type="button" onClick={cancelar}
              className="text-text-muted hover:text-text-main transition-colors rounded-lg p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleGuardar} className="space-y-5">
            {/* Logo uploader */}
            <LogoUploader
              value={form.logoUrl}
              onChange={b64 => setForm(f => ({ ...f, logoUrl: b64 }))}
              disabled={saving}
            />

            {/* Nombre */}
            <div className="space-y-1">
              <Label htmlFor="inst-nombre">Nombre *</Label>
              <Input id="inst-nombre" placeholder="Municipalidad de…"
                value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                disabled={saving} />
              {errors.nombre && <p className="text-xs text-red-400">{errors.nombre}</p>}
            </div>

            {/* RUT + Teléfono */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="inst-rut">RUT</Label>
                <Input id="inst-rut" placeholder="77.000.000-0"
                  value={form.rut ?? ""} onChange={e => setForm(f => ({ ...f, rut: e.target.value }))}
                  disabled={saving} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="inst-tel">Teléfono</Label>
                <Input id="inst-tel" placeholder="+56 2 2000 0000"
                  value={form.telefono ?? ""} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                  disabled={saving} />
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-1">
              <Label htmlFor="inst-dir">Dirección</Label>
              <Input id="inst-dir" placeholder="Av. Ejemplo 123, Ciudad"
                value={form.direccion ?? ""} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
                disabled={saving} />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="inst-email">Correo electrónico</Label>
              <Input id="inst-email" type="email" placeholder="contacto@institucion.cl"
                value={form.email ?? ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                disabled={saving} />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Slug (URL) */}
            <div className="space-y-1">
              <Label htmlFor="inst-slug">Slug de URL</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted shrink-0">/{}</span>
                <Input id="inst-slug" placeholder="ej: municipalidad-providencia"
                  value={(form as any).slug ?? ''}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                  disabled={saving} />
              </div>
              <p className="text-xs text-text-muted/60">URL de acceso público: <span className="text-primary">/{(form as any).slug || 'slug'}</span></p>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={saving} className="gap-2">
                <Check className="h-4 w-4" />
                {saving ? "Guardando…" : editingId !== null ? "Guardar cambios" : "Crear institución"}
              </Button>
              <Button type="button" variant="outline" onClick={cancelar} disabled={saving}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-text-muted">Cargando instituciones…</div>
        ) : instituciones.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Building2 className="mx-auto h-8 w-8 text-text-muted/40" />
            <p className="text-sm text-text-muted">No hay instituciones registradas.</p>
            <Button size="sm" variant="outline" onClick={openCreate} className="mt-2 gap-2">
              <Plus className="h-3.5 w-3.5" />Crear la primera
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-muted">Logo</th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">Institución</th>
                <th className="px-4 py-3 text-left font-medium text-text-muted hidden md:table-cell">RUT</th>
                <th className="px-4 py-3 text-left font-medium text-text-muted hidden lg:table-cell">Contacto</th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">Estado</th>
                <th className="px-4 py-3 text-right font-medium text-text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {instituciones.map(inst => (
                <tr key={inst.id} className="hover:bg-surface-hover transition-colors">
                  {/* Logo */}
                  <td className="px-4 py-3 w-14">
                    {inst.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={inst.logoUrl}
                        alt={`Logo ${inst.nombre}`}
                        className="h-10 w-10 rounded-lg object-contain border border-border bg-background/70 p-0.5"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-border">
                        <Building2 className="h-5 w-5 text-primary/60" />
                      </div>
                    )}
                  </td>
                  {/* Nombre + dirección */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-main leading-tight">{inst.nombre}</p>
                    {inst.direccion && (
                      <p className="text-xs text-text-muted mt-0.5 truncate max-w-[200px]">{inst.direccion}</p>
                    )}
                  </td>
                  {/* RUT */}
                  <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                    {inst.rut ?? <span className="text-text-muted/40">—</span>}
                  </td>
                  {/* Contacto */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="space-y-0.5">
                      {inst.email    && <p className="text-xs text-text-muted">{inst.email}</p>}
                      {inst.telefono && <p className="text-xs text-text-muted">{inst.telefono}</p>}
                      {!inst.email && !inst.telefono && <span className="text-xs text-text-muted/40">—</span>}
                    </div>
                  </td>
                  {/* Estado */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      inst.activo
                        ? "bg-green-500/15 text-green-400 border-green-500/30"
                        : "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
                    }`}>
                      {inst.activo ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => openEdit(inst)} title="Editar"
                        className="rounded-lg p-1.5 text-text-muted hover:bg-blue-500/10 hover:text-blue-400 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => handleToggleActivo(inst)}
                        title={inst.activo ? "Desactivar" : "Activar"}
                        className={`rounded-lg p-1.5 transition-colors ${
                          inst.activo
                            ? "text-text-muted hover:bg-red-500/10 hover:text-red-400"
                            : "text-text-muted hover:bg-green-500/10 hover:text-green-400"
                        }`}>
                        {inst.activo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
