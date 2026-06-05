// Layout protegido del dashboard — Server Component
// El middleware ya validó el JWT; aquí solo componemos la UI
import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar lateral (Client Component) */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  )
}
