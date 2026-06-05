import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({
  title = 'Ocurrió un error',
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
        <AlertCircle className="h-6 w-6 text-red-400" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-text-main">{title}</h3>
        <p className="mt-1 text-sm text-text-muted">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Intentar de nuevo
        </Button>
      )}
    </div>
  )
}
