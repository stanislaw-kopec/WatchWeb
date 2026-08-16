import { Bell } from 'lucide-react'
import { Link } from 'react-router'

import { useUnreadNotificationCount } from '@/entities/notification/api/useNotifications'
import { Button } from '@/shared/ui/button'

type NotificationBellButtonProps = {
  enabled: boolean
}

export function NotificationBellButton({ enabled }: NotificationBellButtonProps) {
  const unreadCountQuery = useUnreadNotificationCount(enabled)
  const unreadCount = unreadCountQuery.data?.count ?? 0

  return (
    <Button asChild variant="ghost" size="icon">
      <Link className="relative" to="/notifications" aria-label={getAriaLabel(unreadCount)}>
        <Bell className="size-4" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold leading-5 text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </Link>
    </Button>
  )
}

function getAriaLabel(unreadCount: number) {
  return unreadCount > 0
    ? `Powiadomienia, nieprzeczytane: ${unreadCount}`
    : 'Powiadomienia'
}
