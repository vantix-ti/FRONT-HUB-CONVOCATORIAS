"use client";

import { useState, useEffect, useCallback } from "react";
import { getTokenClient } from "@/lib/auth";
import { useIsVantixAdmin } from "@/hooks/useIsVantixAdmin";
import { getInstituciones, createInstitucion, updateInstitucion } from "@/lib/api/instituciones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/useToast";
import { Building2, Plus, Pencil, ToggleLeft, ToggleRight, X, Check } from "lucide-react";
import type { Institucion, CreateInstitucionRequest } from "@/lib/types";

const EMPTY_FORM: CreateInstitucionRequest = {
  nombre: "", rut: "", direccion: "", telefono: "", email: "",
};

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
      const data = await getInstituciones(token);
      setInstituciones(data);
    } catch {
      toast({ title: "Error al cargar instituciones", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowForm(true);
  }

  function openEdit(inst: Institucion) {
    setEditingId(inst.id);
    setForm({
      nombre:    inst.nombre    ?? "",
      rut:       inst.rut       ?? "",
      direccion: inst.direccion ?? "",
      telefono:  inst.telefono  ?? "",
      email:     inst.email     ?? "",
    });
    setErrors({});
    setShowForm(true);
    // scroll al formulario
    setTimeout(() => document.getElementById("inst-form")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function cancelar() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
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
    };
    try {
      if (editingId !== null) {
        await updateInstitucion(editingId, payload, token);
        toast({ title: "Institución actualizada", variant: "success" });
      } else {
        await createInstitucion(payload, token);
        toast({ title: "Institución creada exitosamente", variant: "success" });
      }
      cancelar();
      cargar();
    } catch (err) {
      toast({ title: "Error al guardar", description: String(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActivo(inst: Institucion) {
    const token = getTokenClient();
    if (!token) return;
    try {
      await updateInstitucion(inst.id, { nombre: inst.nombre, activo: !inst.activo }, token);
      toast({
        title: inst.activo ? "Institución desactivada" : "Institución activada",
        variant: "success",
      });
      cargar();
    } catch {
      toast({ title: "Error al cambiar estado", variant: "destructive" });
    }
  }

  // Bloqueo si no es Vantix ADMIN
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
            <Plus className="h-4 w-4" />
            Nueva institución
          </Button>
        )}
      </div>

      {/* Formulario crear / editar */}
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
          <form onSubmit={handleGuardar} className="space-y-4">
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
                  {/* Nombre + dirección */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-text-main leading-tight">{inst.nombre}</p>
                        {inst.direccion && (
                          <p className="text-xs text-text-muted mt-0.5 truncate max-w-[200px]">{inst.direccion}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* RUT */}
                  <td className="px-4 py-3 text-text-muted hidden md:table-cell">
                    {inst.rut ?? <span className="text-text-muted/40">—</span>}
                  </td>
                  {/* Contacto */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="space-y-0.5">
                      {inst.email   && <p className="text-xs text-text-muted">{inst.email}</p>}
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
                      <button type="button" onClick={() => openEdit(inst)}
                        title="Editar"
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
                        {inst.activo
                          ? <ToggleRight className="h-4 w-4" />
                          : <ToggleLeft  className="h-4 w-4" />}
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
