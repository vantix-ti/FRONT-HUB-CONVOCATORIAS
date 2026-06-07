// ============================================================
// Tipos TypeScript globales del sistema Hub Convocatorias
// ============================================================

// --- Roles del sistema ---
export type Rol = 'ADMIN' | 'GESTOR' | 'POSTULANTE' | 'REVISOR'

// --- Estado de convocatoria ---
export type EstadoConvocatoria = 'BORRADOR' | 'PUBLICADA' | 'CERRADA' | 'CANCELADA'

// --- Estado de postulación ---
export type EstadoPostulacion = 'BORRADOR' | 'ENVIADA' | 'EN_REVISION' | 'APROBADA' | 'RECHAZADA'

// --- Tipo de campo de formulario ---
export type TipoCampo = 'TEXTO' | 'NUMERO' | 'FECHA' | 'TEXTO_LARGO' | 'SELECCION' | 'ARCHIVO'

// ---- Autenticación ----

export interface LoginRequest {
  email: string
  passwordEncrypted: string
}

export interface LoginResponse {
  token: string
  roles: Rol[]
  email: string
}

export interface RegisterRequest {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  email: string
  passwordEncrypted: string
  telefono: string
}

export interface ResetPasswordRequest {
  token: string
  passwordEncrypted: string
}

// ---- Usuario ----
export interface Usuario {
  id: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  email: string
  telefono: string
  roles: string[]      // el backend devuelve Set<String> ej. ["ADMIN"]
  confirmado: boolean  // campo real del backend
  activo: boolean
  creadoEn: string
}


export interface UpdateUsuarioRequest {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  telefono: string
}

// ---- Convocatoria ----

export interface Convocatoria {
  id: string
  titulo: string
  descripcion: string
  estado: EstadoConvocatoria
  fechaInicio: string
  fechaFin: string
  organizacion: string
  imagen?: string
  creadoEn: string
  actualizadoEn: string
}

export interface CreateConvocatoriaRequest {
  titulo: string
  descripcion: string
  fechaInicio: string
  fechaFin: string
  organizacion: string
  imagen?: string
}

export interface UpdateConvocatoriaRequest extends CreateConvocatoriaRequest {}

export interface UpdateEstadoConvocatoriaRequest {
  estado: EstadoConvocatoria
}

// ---- Etapas ----

export interface CampoFormulario {
  id: string
  etapaId: string
  nombre: string
  descripcion?: string
  tipo: TipoCampo
  requerido: boolean
  orden: number
  opciones?: string[]
}

export interface CriterioEvaluacion {
  id: string
  etapaId: string
  nombre: string
  descripcion?: string
  puntajeMaximo: number
  orden: number
}

export interface Etapa {
  id: string
  convocatoriaId: string
  nombre: string
  descripcion?: string
  orden: number
  campos: CampoFormulario[]
  criterios: CriterioEvaluacion[]
}

export interface CreateEtapaRequest {
  nombre: string
  descripcion?: string
  orden: number
}

export interface UpdateEtapaRequest extends CreateEtapaRequest {}

export interface CreateCampoRequest {
  nombre: string
  descripcion?: string
  tipo: TipoCampo
  requerido: boolean
  orden: number
  opciones?: string[]
}

export interface CreateCriterioRequest {
  nombre: string
  descripcion?: string
  puntajeMaximo: number
  orden: number
}

// ---- Postulaciones ----

export interface RespuestaCampo {
  campoId: string
  valorTexto?: string
  valorNumero?: number
  valorFecha?: string
}

export interface Postulacion {
  id: string
  convocatoriaId: string
  convocatoriaTitulo?: string
  usuarioId: string
  estado: EstadoPostulacion
  respuestas: RespuestaCampo[]
  creadoEn: string
  actualizadoEn: string
}

export interface CreatePostulacionRequest {
  convocatoriaId: string
}

// ---- Evaluaciones ----

export interface PuntajeCriterio {
  criterioId: string
  puntaje: number
}

export interface Evaluacion {
  id: string
  postulacionId: string
  etapaId: string
  revisorId: string
  revisorNombre?: string
  comentario?: string
  puntajesPorCriterio: Record<string, number>
  finalizada: boolean
  creadoEn: string
  actualizadoEn: string
}

export interface AsignarEvaluacionRequest {
  postulacionId: string
  etapaId: string
  revisorIds: string[]
}

export interface UpdateEvaluacionRequest {
  comentario?: string
  puntajesPorCriterio: Record<string, number>
}

// ---- Notificaciones ----

export interface Notificacion {
  id: string
  usuarioId: string
  titulo: string
  mensaje: string
  leida: boolean
  tipo?: string
  enlace?: string
  creadoEn: string
}

// ---- Dashboard ----

export interface DashboardStats {
  totalPostulaciones: number
  postulacionesAprobadas: number
  postulacionesEnRevision: number
  postulacionesRechazadas: number
  totalEtapas: number
  etapasCompletadas: number
}

export interface UltimaPostulacion {
  id: number
  postulanteNombre: string
  convocatoriaTitulo: string
  fecha: string
  estado: string
}

export interface PuntoTemporal {
  fecha: string
  enviadas: number
  creadas: number
}

export interface DashboardGlobal {
  convocatoriasActivas: number
  totalPostulaciones: number
  revisoresAsignados: number
  seleccionados: number
  seleccionadosPorcentaje: number
  postulacionesPorEstado: Record<string, number>
  ultimasPostulaciones: UltimaPostulacion[]
  evolucionTemporal: PuntoTemporal[]
}

// ---- API Genérica ----

export interface ApiError {
  message: string
  status: number
  code?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// ---- Sesión JWT (payload decodificado) ----
// NOTA: el backend codifica roles como string CSV "ROLE_ADMIN,ROLE_REVISOR".
// Después de getSession() siempre es Rol[], pero el tipo refleja la realidad raw.
export interface JwtPayload {
  sub: string
  email: string
  roles: Rol[] | string   // ← cambiado de Rol[]
  exp: number
  iat: number
  institucionId?: number
}


// ---- Institución ----
export interface Institucion {
  id: number
  nombre: string
  rut?: string
  direccion?: string
  telefono?: string
  email?: string
  logoUrl?: string
  activo: boolean
  creadoEn?: string
}

export interface CreateInstitucionRequest {
  nombre: string
  rut?: string
  direccion?: string
  telefono?: string
  email?: string
  logoUrl?: string
}

// ---- Configuración de Plataforma ----
export interface ConfiguracionPlataformaResponse {
  institucionId: number
  valores: Record<string, string>
}

// ---- Registro de Gestor ----
export interface RegisterGestorRequest {
  nombre: string
  apellidoPaterno: string
  apellidoMaterno?: string
  email: string
  passwordEncrypted: string
  telefono?: string
  instNombre: string
  instRut?: string
  instDireccion?: string
  instTelefono?: string
  instEmail?: string
}
