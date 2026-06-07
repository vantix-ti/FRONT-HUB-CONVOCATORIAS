import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Hub Convocatorias',
    template: '%s | Hub Convocatorias',
  },
  description: 'Plataforma de gestión de convocatorias, postulaciones y evaluaciones.',
  keywords: ['convocatorias', 'postulaciones', 'evaluaciones', 'becas', 'concursos'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body
        className="min-h-screen flex flex-col bg-background text-text-main antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
