// ============================================================
// Cliente HTTP central para el BFF
// Todos los requests llevan X-API-Key y Authorization (si hay sesión)
// ============================================================

const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL ?? 'http://localhost:8081/bff'
const BFF_API_KEY = process.env.NEXT_PUBLIC_BFF_API_KEY ?? 'bff-dev-secret-2026'

// Construye los headers base para cada request
function buildHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': BFF_API_KEY,
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// Opciones extendidas para el cliente BFF
interface BffRequestOptions extends RequestInit {
  token?: string
}

// Función genérica de fetch con manejo de errores
async function bffFetch<T>(
  path: string,
  options: BffRequestOptions = {}
): Promise<T> {
  const { token, headers: extraHeaders, ...rest } = options

  const response = await fetch(`${BFF_URL}${path}`, {
    ...rest,
    headers: {
      ...buildHeaders(token),
      ...(extraHeaders as Record<string, string>),
    },
  })

  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`
    try {
      const errorBody = await response.json()
      errorMessage = errorBody.message ?? errorBody.error ?? errorMessage
    } catch {
      // Ignorar errores de parseo
    }
    throw new Error(errorMessage)
  }

  // Respuesta vacía (204 No Content)
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

// ---- Métodos HTTP expuestos ----

export const bff = {
  get: <T>(path: string, options?: BffRequestOptions) =>
    bffFetch<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body?: unknown, options?: BffRequestOptions) =>
    bffFetch<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T>(path: string, body?: unknown, options?: BffRequestOptions) =>
    bffFetch<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(path: string, options?: BffRequestOptions) =>
    bffFetch<T>(path, { method: 'DELETE', ...options }),

  // Fetch sin cache (datos dinámicos - RSC)
  getNoCache: <T>(path: string, options?: BffRequestOptions) =>
    bffFetch<T>(path, {
      method: 'GET',
      cache: 'no-store',
      ...options,
    }),

  // Fetch con revalidación (datos relativamente estables - RSC)
  getCached: <T>(path: string, revalidate = 60, options?: BffRequestOptions) =>
    bffFetch<T>(path, {
      method: 'GET',
      next: { revalidate },
      ...options,
    } as BffRequestOptions),
}

export { BFF_URL, BFF_API_KEY }
