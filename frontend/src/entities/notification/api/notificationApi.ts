import type { Notification } from '@/entities/notification/model/types'
import { httpClient } from '@/shared/api/httpClient'
import type { PageResponse } from '@/shared/api/page'

export type NotificationListParams = {
  page?: number
  size?: number
  sort?: string
}

export type UnreadNotificationCountResponse = {
  count: number
}

export function getNotifications(params: NotificationListParams = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return httpClient<PageResponse<Notification>>(`/api/notifications${query ? `?${query}` : ''}`)
}

export function getUnreadNotificationCount() {
  return httpClient<UnreadNotificationCountResponse>('/api/notifications/unread-count')
}

export function markNotificationAsRead(notificationId: string) {
  return httpClient<Notification>(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
  })
}
