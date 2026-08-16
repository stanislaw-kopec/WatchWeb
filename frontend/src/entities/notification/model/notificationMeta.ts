import type { Notification, NotificationType } from '@/entities/notification/model/types'

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  POST_APPROVED: 'Post zaakceptowany',
  POST_REJECTED: 'Post odrzucony',
  WATCH_SUBMISSION_APPROVED: 'Zegarek zaakceptowany',
  WATCH_SUBMISSION_REJECTED: 'Zgłoszenie odrzucone',
}

export const NOTIFICATION_TYPE_DESCRIPTIONS: Record<NotificationType, string> = {
  POST_APPROVED: 'Twój post jest już widoczny publicznie.',
  POST_REJECTED: 'Twój post wymaga poprawek albo został odrzucony.',
  WATCH_SUBMISSION_APPROVED: 'Zgłoszony zegarek został dodany do katalogu.',
  WATCH_SUBMISSION_REJECTED: 'Zgłoszenie zegarka wymaga poprawek albo zostało odrzucone.',
}

export type NotificationTargetLink = {
  label: string
  to: string
}

export function getNotificationTargetLink(
  notification: Notification,
): NotificationTargetLink | null {
  if (!notification.targetId) {
    return null
  }

  switch (notification.type) {
    case 'POST_APPROVED':
      return {
        label: 'Zobacz post',
        to: `/posts/${notification.targetId}`,
      }
    case 'POST_REJECTED':
      return {
        label: 'Moje odrzucone posty',
        to: '/me/posts?status=REJECTED',
      }
    case 'WATCH_SUBMISSION_APPROVED':
      return {
        label: 'Zobacz zegarek',
        to: `/watches/${notification.targetId}`,
      }
    case 'WATCH_SUBMISSION_REJECTED':
      return {
        label: 'Moje odrzucone zgłoszenia',
        to: '/me/watch-submissions?status=REJECTED',
      }
  }
}
