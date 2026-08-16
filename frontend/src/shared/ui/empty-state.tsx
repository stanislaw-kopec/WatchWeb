import { Inbox } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'
import { Card, CardContent } from '@/shared/ui/card'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  icon?: LucideIcon
  size?: 'default' | 'compact'
}

export function EmptyState({
  title,
  description,
  action,
  className,
  icon: Icon = Inbox,
  size = 'default',
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent
        className={cn(
          'flex flex-col items-center justify-center px-6 text-center',
          size === 'default' ? 'min-h-44 py-10' : 'min-h-32 py-7',
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-md bg-secondary text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </CardContent>
    </Card>
  )
}
