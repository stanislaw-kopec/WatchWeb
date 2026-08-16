import type { NotificationListParams } from '@/entities/notification/api/notificationApi'
import type { Notification } from '@/entities/notification/model/types'

export type NotificationReadFilter = 'ALL' | 'UNREAD' | 'READ'

export type NotificationSearchState = {
  read: NotificationReadFilter
  page: number
  size: number
}

export const DEFAULT_NOTIFICATION_PAGE_SIZE = 10

export const NOTIFICATION_PAGE_SIZES = [10, 20, 40] as const

const NOTIFICATION_READ_FILTER_VALUES: NotificationReadFilter[] = ['ALL', 'UNREAD', 'READ']

export function parseNotificationSearchParams(
  searchParams: URLSearchParams,
): NotificationSearchState {
  const read = searchParams.get('read')

  return {
    read: isNotificationReadFilter(read) ? read : 'ALL',
    page: parsePositiveInteger(searchParams.get('page'), 0),
    size: parsePageSize(searchParams.get('size')),
  }
}

export function toNotificationListParams(state: NotificationSearchState): NotificationListParams {
  return {
    page: state.page,
    size: state.size,
    sort: 'createdAt,desc',
  }
}

export function buildNotificationSearchParams(
  read: NotificationReadFilter,
  page: number,
  size: number,
) {
  const params = new URLSearchParams()

  if (read !== 'ALL') {
    params.set('read', read)
  }
  if (page > 0) {
    params.set('page', String(page))
  }
  if (size !== DEFAULT_NOTIFICATION_PAGE_SIZE) {
    params.set('size', String(size))
  }

  return params
}

export function filterNotifications(
  notifications: Notification[],
  read: NotificationReadFilter,
) {
  if (read === 'UNREAD') {
    return notifications.filter((notification) => !notification.read)
  }

  if (read === 'READ') {
    return notifications.filter((notification) => notification.read)
  }

  return notifications
}

function isNotificationReadFilter(value: string | null): value is NotificationReadFilter {
  return NOTIFICATION_READ_FILTER_VALUES.includes(value as NotificationReadFilter)
}

function parsePageSize(value: string | null) {
  const size = parsePositiveInteger(value, DEFAULT_NOTIFICATION_PAGE_SIZE)

  return NOTIFICATION_PAGE_SIZES.includes(size as (typeof NOTIFICATION_PAGE_SIZES)[number])
    ? size
    : DEFAULT_NOTIFICATION_PAGE_SIZE
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}
