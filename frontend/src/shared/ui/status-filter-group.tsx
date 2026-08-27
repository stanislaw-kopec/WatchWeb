import { cn } from '@/shared/lib/utils'

export type StatusFilterOption<Value extends string> = {
  value: Value
  label: string
}

type StatusFilterGroupProps<Value extends string> = {
  value: Value
  options: ReadonlyArray<StatusFilterOption<Value>>
  ariaLabel: string
  disabled?: boolean
  onChange: (value: Value) => void
  className?: string
}

export function StatusFilterGroup<Value extends string>({
  value,
  options,
  ariaLabel,
  disabled,
  onChange,
  className,
}: StatusFilterGroupProps<Value>) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const isActive = value === option.value

        return (
          <button
            aria-pressed={isActive}
            className={cn(
              'h-9 rounded-md border border-input bg-card px-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-secondary-foreground disabled:pointer-events-none disabled:opacity-50',
              isActive && 'border-primary bg-secondary text-secondary-foreground',
            )}
            disabled={disabled}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
