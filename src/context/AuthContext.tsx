'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  getSession,
  getTokenClient,
  setTokenClient,
  removeTokenClient,
} from '@/lib/auth'
import { bff } from '@/lib/bff'
import type { JwtPayload, LoginRequest, LoginResponse, Rol } from '@/lib/types'

// ---- Tipos ----

interface AuthState {
  session: JwtPayload | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, passwordEncrypted: string) => Promise<LoginResponse>
  logout: () => void
  hasRole: (roles: Rol | Rol[]) => boolean
  refresh: () => void
}

// ---- Contexto ----

const AuthContext = createContext<AuthContextValue | null>(null)

// ---- Provider ----

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const refresh = useCallback(() => {
    const token = getTokenClient()
    const session = getSession()
    setState({
      session,
      token,
      isLoading: false,
      isAuthenticated: !!session,
    })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(
    async (email: string, passwordEncrypted: string): Promise<LoginResponse> => {
      const body: LoginRequest = { email, passwordEncrypted }
      const response = await bff.post<LoginResponse>('/auth/login', body)
      setTokenClient(response.token)
      const session = getSession()
      setState({
        session,
        token: response.token,
        isLoading: false,
        isAuthenticated: true,
      })
      return response
    },
    []
  )

  const logout = useCallback(() => {
    removeTokenClient()
    setState({
      session: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    })
    window.location.href = '/auth/login'
  }, [])

  const hasRole = useCallback(
    (roles: Rol | Rol[]): boolean => {
      if (!state.session) return false
      const rolesArray = Array.isArray(roles) ? roles : [roles]
      const sessionRoles = Array.isArray(state.session.roles)
        ? (state.session.roles as Rol[])
        : typeof state.session.roles === 'string'
          ? (state.session.roles as string)
              .split(',')
              .map((r) => r.trim().replace(/^ROLE_/, '') as Rol)
              .filter((r) => r.length > 0)
          : []
      return sessionRoles.some((r) => rolesArray.includes(r))
    },
    [state.session]
  )

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasRole, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

// ---- Hook de consumo ----

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
