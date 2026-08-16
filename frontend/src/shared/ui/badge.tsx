import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib/utils'

type BadgeProps = ComponentProps<'span'> & {
  variant?: 'default' | 'secondary' | 'outline'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
        variant === 'default' && 'bg-primary text-primary-foreground',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground',
        variant === 'outline' && 'border border-border bg-card text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}
