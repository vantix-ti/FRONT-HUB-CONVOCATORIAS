import type { DashboardGlobal } from '@/lib/types'

const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL ?? 'http://localhost:8081/bff'

export async function getDashboardGlobal(token: string): Promise<DashboardGlobal> {
  const res = await fetch(`${BFF_URL}/dashboard/global`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Error al obtener dashboard: ${res.status}`)
  }
  return res.json()
}
