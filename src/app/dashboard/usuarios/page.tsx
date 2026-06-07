"use client";

import { useState, useEffect, useCallback } from "react";
import { getTokenClient } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { listarUsuarios, crearUsuario, updateRolUsuario } from "@/lib/api/usuarios";
import { getInstituciones, getInstitucion, createInstitucion } from "@/lib/api/instituciones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/useToast";
import { Users, UserPlus, Shield, User, Eye, EyeOff, Mail, KeyRound, Building2 } from "lucide-react";
import type { Usuario, Institucion } from "@/lib/types";

const ROLES_BASE  = ["ADMIN", "REVISOR", "POSTULANTE"] as const;
const ROLES_VANTIX = ["ADMIN", "GESTOR", "REVISOR", "POSTULANTE"] as const;
type Rol = "ADMIN" | "GESTOR" | "REVISOR" | "POSTULANTE";

const rolColor: Record<string, string> = {
  ADMIN:      "bg-red-500/15 text-red-400 border-red-500/30",
  GESTOR:     "bg-purple-500/15 text-purple-400 border-purple-500/30",
  REVISOR:    "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  POSTULANTE: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};
const rolIcon: Record<string, React.ElementType> = {
  ADMIN: Shield, GESTOR: Building2, REVISOR: Eye, POSTULANTE: User,
};

const EMPTY = {
  nombre: "", apellidoPaterno: "", apellidoMaterno: "",
  email: "", telefono: "", rol: "POSTULANTE" as Rol,
};

export default function UsuariosPage() {
  const { session } = useAuth();
  const selfEmail = session?.email || session?.sub;

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [isVantix, setIsVantix] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordMode, setPasswordMode] = useState<"auto" | "manual">("auto");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedInstitucionId, setSelectedInstitucionId] = useState<string>("");
  const [newInstNombre, setNewInstNombre] = useState("");

  const cargar = useCallback(async () => {
    const token = getTokenClient();
    if (!token) return;
    try {
      const us = await listarUsuarios(token);
      setUsuarios(us);

      // Determinar si el admin actual es de Vantix
      const instId = session?.institucionId;
      if (instId) {
        const miInst = await getInstitucion(instId, token).catch(() => null);
        const esVantix = miInst?.nombre?.toLowerCase().includes("vantix") ?? false;
        setIsVantix(esVantix);
        if (esVantix) {
          const insts = await getInstituciones(token).catch(() => [] as Institucion[]);
          setInstituciones(insts);
        }
      } else {
        // Sin institución en el token → admin legacy (Vantix)
        setIsVantix(true);
        const insts = await getInstituciones(token).catch(() => [] as Institucion[]);
        setInstituciones(insts);
      }
    } catch {
      toast({ title: "Error al cargar usuarios", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => { cargar(); }, [cargar]);

  // Nombre de institución a partir del ID
  const instNombre = (u: Usuario): string | null => {
    if (!u.institucionId) return null;
    return instituciones.find(i => i.id === (u.institucionId as unknown as number))?.nombre
      ?? `#${u.institucionId}`;
  };

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    const token = getTokenClient();
    if (!token) return;
    if (passwordMode === "manual" && password.length < 8) {
      toast({ title: "La contraseña debe tener al menos 8 caracteres", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        nombre: form.nombre, apellidoPaterno: form.apellidoPaterno,
        apellidoMaterno: form.apellidoMaterno, email: form.email,
        telefono: form.telefono, rol: form.rol,
        ...(passwordMode === "manual" ? { password } : {}),
      };

      // Institución para GESTOR (solo Vantix puede asignar)
      if (isVantix && form.rol === "GESTOR") {
        if (selectedInstitucionId) {
          payload.institucionId = selectedInstitucionId;
        } else if (newInstNombre.trim()) {
          const inst = await createInstitucion({ nombre: newInstNombre.trim() }, token);
          payload.institucionId = String(inst.id);
          setInstituciones(prev => [...prev, inst]);
        }
      }

      await crearUsuario(payload as Parameters<typeof crearUsuario>[0], token);
      toast({
        title: `Usuario ${form.email} creado`,
        description: passwordMode === "auto"
          ? "Se envió un correo de activación al usuario."
          : "La cuenta está activa con la contraseña ingresada.",
        variant: "success",
      });
      setForm(EMPTY); setPassword(""); setPasswordMode("auto");
      setSelectedInstitucionId(""); setNewInstNombre("");
      setShowForm(false);
      cargar();
    } catch (err) {
      toast({ title: "Error al crear usuario", description: String(err), variant: "destructive" });
    } finally { setSaving(false); }
  }

  async function handleCambiarRol(id: string, nuevoRol: string) {
    const token = getTokenClient();
    if (!token) return;
    try {
      await updateRolUsuario(id, nuevoRol, token);
      toast({ title: "Rol actualizado", variant: "success" });
      cargar();
    } catch {
      toast({ title: "Error al cambiar rol", variant: "destructive" });
    }
  }

  const ROLES_DISPONIBLES = isVantix ? ROLES_VANTIX : ROLES_BASE;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-main">Gestión de usuarios</h1>
            <p className="text-sm text-text-muted">
              {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowForm(v => !v)}>
          <UserPlus className="h-4 w-4" />
          {showForm ? "Cancelar" : "Nuevo usuario"}
        </Button>
      </div>

      {/* Formulario nuevo usuario */}
      {showForm && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-base font-semibold text-text-main mb-4">Crear nuevo usuario</h2>
          <form onSubmit={handleCrear} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Nombre *</Label>
                <Input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required disabled={saving} />
              </div>
              <div className="space-y-1">
                <Label>Apellido paterno *</Label>
                <Input value={form.apellidoPaterno} onChange={e => setForm(f => ({ ...f, apellidoPaterno: e.target.value }))} required disabled={saving} />
              </div>
              <div className="space-y-1">
                <Label>Apellido materno</Label>
                <Input value={form.apellidoMaterno} onChange={e => setForm(f => ({ ...f, apellidoMaterno: e.target.value }))} disabled={saving} />
              </div>
              <div className="space-y-1">
                <Label>Teléfono</Label>
                <Input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} disabled={saving} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Correo electrónico *</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required disabled={saving} />
              </div>
              <div className="space-y-1">
                <Label>Rol *</Label>
                <select
                  value={form.rol}
                  onChange={e => {
                    setForm(f => ({ ...f, rol: e.target.value as Rol }));
                    setSelectedInstitucionId(""); setNewInstNombre("");
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={saving}
                >
                  {ROLES_DISPONIBLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Sección institución — solo Vantix y solo para GESTOR */}
            {isVantix && form.rol === "GESTOR" && (
              <div className="rounded-lg border border-purple-900/40 bg-purple-900/10 p-4 space-y-3">
                <div className="flex items-center gap-2 text-purple-300 mb-1">
                  <Building2 size={14} />
                  <span className="text-xs font-semibold">Institución del Gestor</span>
                </div>
                {instituciones.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-xs">Seleccionar institución existente</Label>
                    <select
                      value={selectedInstitucionId}
                      onChange={e => { setSelectedInstitucionId(e.target.value); if (e.target.value) setNewInstNombre(""); }}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={saving}
                    >
                      <option value="">— Nueva institución —</option>
                      {instituciones.map(i => <option key={i.id} value={String(i.id)}>{i.nombre}</option>)}
                    </select>
                  </div>
                )}
                {!selectedInstitucionId && (
                  <div className="space-y-1">
                    <Label className="text-xs">
                      Nombre de nueva institución{instituciones.length === 0 ? " *" : ""}
                    </Label>
                    <Input
                      placeholder="Ej. Mi Empresa SpA"
                      value={newInstNombre}
                      onChange={e => setNewInstNombre(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Contraseña */}
            <div className="rounded-lg border border-border bg-background/50 p-4 space-y-3">
              <Label className="text-sm font-medium text-text-main">Contraseña inicial</Label>
              <div className="flex gap-2">
                {(["auto", "manual"] as const).map(m => (
                  <button key={m} type="button" onClick={() => setPasswordMode(m)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${passwordMode === m ? "border-primary bg-primary/10 text-primary" : "border-border text-text-muted hover:border-primary/50"}`}>
                    {m === "auto" ? <><Mail className="h-3.5 w-3.5" /> Enviar por correo</> : <><KeyRound className="h-3.5 w-3.5" /> Ingresar manualmente</>}
                  </button>
                ))}
              </div>
              {passwordMode === "auto" ? (
                <p className="text-xs text-text-muted">Se enviará un correo con un enlace de activación (válido 72 h).</p>
              ) : (
                <div className="space-y-1">
                  <Label className="text-xs">Contraseña (mínimo 8 caracteres) *</Label>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Contraseña inicial" minLength={8} required disabled={saving} className="pr-10" />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-text-muted">La cuenta quedará activa de inmediato.</p>
                </div>
              )}
            </div>

            <Button type="submit" disabled={saving} className="gap-2">
              <UserPlus className="h-4 w-4" />
              {saving ? "Creando..." : "Crear usuario"}
            </Button>
          </form>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-text-muted">Cargando usuarios...</div>
        ) : usuarios.length === 0 ? (
          <div className="py-12 text-center text-sm text-text-muted">No hay usuarios registrados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-muted">Usuario</th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">Correo</th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">Rol</th>
                {isVantix && (
                  <th className="px-4 py-3 text-left font-medium text-text-muted">Institución</th>
                )}
                <th className="px-4 py-3 text-left font-medium text-text-muted">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">Cambiar rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usuarios.map(u => {
                const rol = (u.roles?.[0] ?? "POSTULANTE");
                const RolIcon = rolIcon[rol] ?? User;
                const inst = instNombre(u);
                return (
                  <tr key={u.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3 font-medium text-text-main">{u.nombre} {u.apellidoPaterno}</td>
                    <td className="px-4 py-3 text-text-muted">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${rolColor[rol] ?? ""}`}>
                        <RolIcon className="h-3 w-3" />
                        {rol}
                      </span>
                    </td>
                    {isVantix && (
                      <td className="px-4 py-3 text-xs text-text-muted">
                        {inst ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 size={11} className="text-purple-400 shrink-0" />
                            {inst}
                          </span>
                        ) : (
                          <span className="text-text-muted/40">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${u.confirmado ? "text-green-400" : "text-yellow-400"}`}>
                        {u.confirmado ? "Verificado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.email === selfEmail ? (
                        <span className="text-xs text-text-muted italic">—</span>
                      ) : (
                        <select
                          key={String(u.id) + "-" + rol}
                          defaultValue={rol}
                          onChange={e => handleCambiarRol(String(u.id), e.target.value)}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {ROLES_DISPONIBLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
