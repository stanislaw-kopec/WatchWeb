import { AlertCircle, RefreshCw } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

type ErrorStateProps = {
  title: string
  description?: string
  className?: string
  isRetrying?: boolean
  onRetry?: () => void
  retryLabel?: string
  size?: 'default' | 'compact'
}

export function ErrorState({
  title,
  description,
  className,
  isRetrying = false,
  onRetry,
  retryLabel = 'Spróbuj ponownie',
  size = 'default',
}: ErrorStateProps) {
  return (
    <Card className={cn('border-destructive/40', className)} role="alert">
      <CardContent
        className={cn(
          'flex flex-col gap-4 p-5 sm:flex-row sm:items-start',
          size === 'compact' && 'p-4',
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
          <AlertCircle className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {onRetry ? (
          <Button
            className="shrink-0"
            disabled={isRetrying}
            onClick={onRetry}
            size={size === 'compact' ? 'sm' : 'default'}
            type="button"
            variant="outline"
          >
            <RefreshCw className={cn('size-4', isRetrying && 'animate-spin')} aria-hidden="true" />
            {isRetrying ? 'Ponawianie...' : retryLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
