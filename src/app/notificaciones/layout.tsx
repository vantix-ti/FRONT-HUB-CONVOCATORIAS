import { Sidebar } from '@/components/layout/Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
      </div>
    </div>
  )
}
