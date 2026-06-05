import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export function LoadingSpinner({ className, size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-border border-t-primary',
          sizeClasses[size]
        )}
        role="status"
        aria-label="Cargando..."
      />
      {text && <p className="text-sm text-text-muted animate-pulse">{text}</p>}
    </div>
  )
}

// Pantalla de carga completa
export function FullPageLoader({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}
