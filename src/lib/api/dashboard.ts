import { bff } from '@/lib/bff'
import type { DashboardGlobal } from '@/lib/types'

export async function getDashboardGlobal(token: string): Promise<DashboardGlobal> {
  return bff.get<DashboardGlobal>('/dashboard/global', { token })
}
