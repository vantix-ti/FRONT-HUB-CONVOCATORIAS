import { bff } from '@/lib/bff'
import type { Institucion, CreateInstitucionRequest } from '@/lib/types'

export async function getInstituciones(token: string): Promise<Institucion[]> {
  return bff.getNoCache<Institucion[]>('/instituciones', { token })
}

export async function getInstitucion(id: number, token?: string): Promise<Institucion> {
  return bff.getNoCache<Institucion>(`/instituciones/${id}`, token ? { token } : undefined)
}

export async function createInstitucion(data: CreateInstitucionRequest, token: string): Promise<Institucion> {
  return bff.post<Institucion>('/instituciones', data, { token })
}

export async function updateInstitucion(id: number, data: CreateInstitucionRequest, token: string): Promise<Institucion> {
  return bff.put<Institucion>(`/instituciones/${id}`, data, { token })
}

export async function getInstitucionBySlug(slug: string): Promise<Institucion> {
  return bff.getNoCache<Institucion>(`/instituciones/slug/${slug}`)
}
