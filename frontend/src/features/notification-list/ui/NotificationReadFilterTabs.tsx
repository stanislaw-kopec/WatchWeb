import type { NotificationReadFilter } from '@/features/notification-list/model/notificationListFilters'
import { StatusFilterGroup } from '@/shared/ui/status-filter-group'

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
    <StatusFilterGroup
      ariaLabel="Filtr powiadomień"
      disabled={disabled}
      onChange={onChange}
      options={OPTIONS}
      value={value}
    />
  )
}
