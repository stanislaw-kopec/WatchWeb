import { ArrowRight, Bell, Check, Clock, MessageSquareText, Watch } from 'lucide-react'
import { Link } from 'react-router'

import { markNotificationAsRead } from '@/entities/notification/api/notificationApi'
import {
  getNotificationTargetLink,
  NOTIFICATION_TYPE_DESCRIPTIONS,
  NOTIFICATION_TYPE_LABELS,
} from '@/entities/notification/model/notificationMeta'
import type { Notification, NotificationType } from '@/entities/notification/model/types'
import { formatDateTime } from '@/shared/lib/date'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type NotificationCardProps = {
  notification: Notification
}

const NOTIFICATION_ICON: Record<NotificationType, typeof Bell> = {
  POST_APPROVED: MessageSquareText,
  POST_REJECTED: MessageSquareText,
  WATCH_SUBMISSION_APPROVED: Watch,
  WATCH_SUBMISSION_REJECTED: Watch,
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const queryClient = useQueryClient()
  const targetLink = getNotificationTargetLink(notification)
  const Icon = NOTIFICATION_ICON[notification.type]

  const markReadMutation = useMutation({
    mutationFn: () => markNotificationAsRead(notification.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] }),
      ])
    },
  })

  return (
    <Card className={cn(!notification.read && 'border-primary/35 bg-secondary/30')}>
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-4">
          <div
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-primary',
              !notification.read && 'bg-primary text-primary-foreground',
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={notification.read ? 'outline' : 'secondary'}>
                {notification.read ? 'Przeczytane' : 'Nowe'}
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3.5" aria-hidden="true" />
                {formatDateTime(notification.createdAt)}
              </span>
            </div>

            <h2 className="mt-3 text-lg font-semibold tracking-normal text-foreground">
              {NOTIFICATION_TYPE_LABELS[notification.type]}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {notification.message}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {NOTIFICATION_TYPE_DESCRIPTIONS[notification.type]}
            </p>

            {notification.readAt ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Przeczytane: {formatDateTime(notification.readAt)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
          {targetLink ? (
            <Button asChild variant="outline">
              <Link to={targetLink.to}>
                {targetLink.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}

          {!notification.read ? (
            <Button
              disabled={markReadMutation.isPending}
              onClick={() => markReadMutation.mutate()}
              type="button"
              variant="outline"
            >
              <Check className="size-4" aria-hidden="true" />
              {markReadMutation.isPending ? 'Zapisywanie' : 'Oznacz jako przeczytane'}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
