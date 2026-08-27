import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

type MetricCardProps = {
  label: string
  value: ReactNode
  icon?: LucideIcon
  className?: string
  valueClassName?: string
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  className,
  valueClassName,
}: MetricCardProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-4 shadow-sm', className)}>
      <div className="flex min-h-20 flex-col justify-between gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          {Icon ? <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" /> : null}
        </div>
        <div className={cn('text-2xl font-semibold tracking-normal text-foreground', valueClassName)}>
          {value}
        </div>
      </div>
    </div>
  )
}
