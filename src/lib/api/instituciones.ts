import { bff } from '@/lib/bff'
import type { Institucion, CreateInstitucionRequest } from '@/lib/types'

export async function getInstituciones(): Promise<Institucion[]> {
  return bff.get<Institucion[]>('/instituciones')
}

export async function getInstitucion(id: number): Promise<Institucion> {
  return bff.get<Institucion>(`/instituciones/${id}`)
}

export async function createInstitucion(data: CreateInstitucionRequest): Promise<Institucion> {
  return bff.post<Institucion>('/instituciones', data)
}

export async function updateInstitucion(id: number, data: CreateInstitucionRequest): Promise<Institucion> {
  return bff.put<Institucion>(`/instituciones/${id}`, data)
}
