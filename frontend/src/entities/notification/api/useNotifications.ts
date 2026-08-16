import { useQuery } from '@tanstack/react-query'

import {
  getNotifications,
  getUnreadNotificationCount,
} from '@/entities/notification/api/notificationApi'
import type { NotificationListParams } from '@/entities/notification/api/notificationApi'

export function useNotifications(params: NotificationListParams = {}, enabled = true) {
  return useQuery({
    enabled,
    queryKey: ['notifications', params],
    queryFn: () => getNotifications(params),
  })
}

export function useUnreadNotificationCount(enabled = true) {
  return useQuery({
    enabled,
    queryKey: ['notifications-unread-count'],
    queryFn: getUnreadNotificationCount,
  })
}
