import type { NotificationReadFilter } from '@/features/notification-list/model/notificationListFilters'
import { cn } from '@/shared/lib/utils'

type NotificationReadFilterTabsProps = {
  value: NotificationReadFilter
  disabled?: boolean
  onChange: (value: NotificationReadFilter) => void
}

const OPTIONS: Array<{ value: NotificationReadFilter; label: string }> = [
  { value: 'ALL', label: 'Wszystkie' },
  { value: 'UNREAD', label: 'Nieprzeczytane' },
  { value: 'READ', label: 'Przeczytane' },
]

export function NotificationReadFilterTabs({
  value,
  disabled,
  onChange,
}: NotificationReadFilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtr powiadomień">
      {OPTIONS.map((option) => {
        const isActive = value === option.value

        return (
          <button
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
