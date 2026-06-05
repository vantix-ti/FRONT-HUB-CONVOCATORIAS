import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  className?: string
  iconColor?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconColor = 'text-primary',
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface p-5 flex flex-col gap-4',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-muted">{title}</p>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10', iconColor.replace('text-', 'bg-').replace('primary', 'primary/10'))}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-text-main">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-text-muted">{description}</p>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'text-xs font-medium',
              trend.value >= 0 ? 'text-green-400' : 'text-red-400'
            )}
          >
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-text-muted">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
