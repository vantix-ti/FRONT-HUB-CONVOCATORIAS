"use client";

import { useState, useEffect, useCallback } from "react";
import { getTokenClient } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import {
  listarUsuarios,
  crearUsuario,
  updateRolUsuario,
} from "@/lib/api/usuarios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/useToast";
import {
  Users,
  UserPlus,
  Shield,
  User,
  Eye,
  EyeOff,
  Mail,
  KeyRound,
} from "lucide-react";
import type { Usuario } from "@/lib/types";

const ROLES = ["ADMIN", "REVISOR", "POSTULANTE"] as const;
type Rol = (typeof ROLES)[number];

const rolColor: Record<Rol, string> = {
  ADMIN: "bg-red-500/15 text-red-400 border-red-500/30",
  REVISOR: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  POSTULANTE: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};
const rolIcon: Record<Rol, React.ElementType> = {
  ADMIN: Shield,
  REVISOR: Eye,
  POSTULANTE: User,
};

const EMPTY = {
  nombre: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  email: "",
  telefono: "",
  rol: "POSTULANTE" as Rol,
};

export default function UsuariosPage() {
  const { session } = useAuth();
  const selfEmail = session?.email || session?.sub; // email del admin logueado
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordMode, setPasswordMode] = useState<"auto" | "manual">("auto");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const cargar = useCallback(async () => {
    const token = getTokenClient();
    if (!token) return;
    try {
      setUsuarios(await listarUsuarios(token));
    } catch (e) {
      toast({ title: "Error al cargar usuarios", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    const token = getTokenClient();
    if (!token) return;
    if (passwordMode === "manual" && password.length < 8) {
      toast({
        title: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        ...(passwordMode === "manual" ? { password } : {}),
      };
      await crearUsuario(payload, token);
      toast({
        title: `Usuario ${form.email} creado`,
        description:
          passwordMode === "auto"
            ? "Se envió un correo de activación al usuario."
            : "La cuenta está activa con la contraseña ingresada.",
        variant: "success",
      });
      setForm(EMPTY);
      setPassword("");
      setPasswordMode("auto");
      setShowForm(false);
      cargar();
    } catch (err) {
      toast({
        title: "Error al crear usuario",
        description: String(err),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-main">
              Gestión de usuarios
            </h1>
            <p className="text-sm text-text-muted">
              {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""}{" "}
              registrado{usuarios.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => setShowForm((v) => !v)}
        >
          <UserPlus className="h-4 w-4" />
          {showForm ? "Cancelar" : "Nuevo usuario"}
        </Button>
      </div>

      {/* Formulario nuevo usuario */}
      {showForm && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-base font-semibold text-text-main mb-4">
            Crear nuevo usuario
          </h2>
          <form onSubmit={handleCrear} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Nombre *</Label>
                <Input
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nombre: e.target.value }))
                  }
                  required
                  disabled={saving}
                />
              </div>
              <div className="space-y-1">
                <Label>Apellido paterno *</Label>
                <Input
                  value={form.apellidoPaterno}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, apellidoPaterno: e.target.value }))
                  }
                  required
                  disabled={saving}
                />
              </div>
              <div className="space-y-1">
                <Label>Apellido materno</Label>
                <Input
                  value={form.apellidoMaterno}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, apellidoMaterno: e.target.value }))
                  }
                  disabled={saving}
                />
              </div>
              <div className="space-y-1">
                <Label>Teléfono</Label>
                <Input
                  value={form.telefono}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, telefono: e.target.value }))
                  }
                  disabled={saving}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Correo electrónico *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                  disabled={saving}
                />
              </div>
              <div className="space-y-1">
                <Label>Rol *</Label>
                <select
                  value={form.rol}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rol: e.target.value as Rol }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={saving}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* ── Sección contraseña ── */}
            <div className="rounded-lg border border-border bg-background/50 p-4 space-y-3">
              <Label className="text-sm font-medium text-text-main">
                Contraseña inicial
              </Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordMode("auto")}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    passwordMode === "auto"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-text-muted hover:border-primary/50"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" /> Enviar por correo
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordMode("manual")}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    passwordMode === "manual"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-text-muted hover:border-primary/50"
                  }`}
                >
                  <KeyRound className="h-3.5 w-3.5" /> Ingresar manualmente
                </button>
              </div>
              {passwordMode === "auto" ? (
                <p className="text-xs text-text-muted">
                  Se enviará un correo al usuario con un enlace para activar su
                  cuenta y establecer su contraseña (válido 72 h).
                </p>
              ) : (
                <div className="space-y-1">
                  <Label className="text-xs">
                    Contraseña (mínimo 8 caracteres) *
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Contraseña inicial"
                      minLength={8}
                      required
                      disabled={saving}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-text-muted">
                    La cuenta quedará activa de inmediato. El usuario podrá
                    cambiar esta contraseña desde su perfil.
                  </p>
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
          <div className="py-12 text-center text-sm text-text-muted">
            Cargando usuarios...
          </div>
        ) : usuarios.length === 0 ? (
          <div className="py-12 text-center text-sm text-text-muted">
            No hay usuarios registrados.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Correo
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Rol
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Estado
                </th>
                <th className="px-4 py-3 text-left font-medium text-text-muted">
                  Cambiar rol
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {usuarios.map((u) => {
                // El backend devuelve roles: string[] ej. ["ADMIN"]
                const rol = (u.roles?.[0] ?? "POSTULANTE") as Rol;
                const RolIcon = rolIcon[rol] ?? User;
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-text-main">
                      {u.nombre} {u.apellidoPaterno}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${rolColor[rol] ?? ""}`}
                      >
                        <RolIcon className="h-3 w-3" />
                        {rol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${u.confirmado ? "text-green-400" : "text-yellow-400"}`}
                      >
                        {u.confirmado ? "Verificado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.email === selfEmail ? (
                        <span className="text-xs text-text-muted italic">
                          —
                        </span>
                      ) : (
                        <select
                          key={String(u.id) + "-" + rol}
                          defaultValue={rol}
                          onChange={(e) =>
                            handleCambiarRol(String(u.id), e.target.value)
                          }
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
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
