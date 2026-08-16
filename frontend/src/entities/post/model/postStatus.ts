import type { PostStatus } from '@/entities/post/model/types'

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  PENDING: 'Oczekuje',
  APPROVED: 'Zaakceptowany',
  REJECTED: 'Odrzucony',
}

export const POST_STATUS_DESCRIPTIONS: Record<PostStatus, string> = {
  PENDING: 'Post czeka na moderację.',
  APPROVED: 'Post jest widoczny publicznie.',
  REJECTED: 'Post wymaga poprawek przed publikacją.',
}
