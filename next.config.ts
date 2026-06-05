import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Configuración de Next.js 15
  experimental: {
    // React Server Components habilitado por defecto en App Router
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8081',
      },
    ],
  },
}

export default nextConfig
