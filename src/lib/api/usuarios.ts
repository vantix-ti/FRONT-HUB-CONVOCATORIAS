// ============================================================
// API de Usuarios — wrapper del BFF
// ============================================================

import { bff } from '../bff'
import type { Usuario, UpdateUsuarioRequest } from '../types'

/** Obtener perfil del usuario autenticado */
export async function getMe(token: string): Promise<Usuario> {
  return bff.getNoCache<Usuario>('/usuarios/me', { token })
}

/** Actualizar perfil del usuario autenticado */
export async function updateMe(data: UpdateUsuarioRequest, token: string): Promise<Usuario> {
  return bff.put<Usuario>('/usuarios/me', data, { token })
}

/** Obtener lista de revisores (ADMIN) */
export async function getRevisores(token: string): Promise<Usuario[]> {
  return bff.getNoCache<Usuario[]>('/usuarios/revisores', { token })
}

/** Cambiar rol de un usuario (ADMIN) */
export async function updateRolUsuario(
  id: string,
  rol: string,
  token: string
): Promise<Usuario> {
  return bff.put<Usuario>(`/usuarios/${id}/rol`, { rol }, { token })
}

/** Obtener notificaciones del usuario */
export async function getNotificaciones(token: string) {
  return bff.getNoCache('/notificaciones', { token })
}

/** Marcar notificación como leída */
export async function marcarLeida(id: string, token: string) {
  return bff.put(`/notificaciones/${id}/leer`, undefined, { token })
}

/** Marcar todas las notificaciones como leídas */
export async function marcarTodasLeidas(token: string) {
  return bff.put('/notificaciones/leer-todas', undefined, { token })
}

/** Listar todos los usuarios (ADMIN) */
export async function listarUsuarios(token: string): Promise<Usuario[]> {
  return bff.getNoCache<Usuario[]>('/usuarios', { token })
}

/** Cambiar contraseña del usuario autenticado */
export async function cambiarPassword(
  data: { passwordActual: string; nuevaPassword: string },
  token: string
): Promise<{ mensaje: string }> {
  return bff.put<{ mensaje: string }>('/usuarios/me/password', data, { token })
}


/** Crear usuario con rol específico (ADMIN) */
export async function crearUsuario(
  data: { nombre: string; apellidoPaterno: string; apellidoMaterno: string;
          email: string; telefono: string; rol: string; password?: string },
  token: string
): Promise<Usuario> {
  return bff.post<Usuario>('/usuarios', data, { token })
}

