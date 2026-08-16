export type NotificationType =
  | 'POST_APPROVED'
  | 'POST_REJECTED'
  | 'WATCH_SUBMISSION_APPROVED'
  | 'WATCH_SUBMISSION_REJECTED'

export type Notification = {
  id: string
  type: NotificationType
  message: string
  targetId: string | null
  read: boolean
  readAt: string | null
  createdAt: string
}
