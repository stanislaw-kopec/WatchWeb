import type { PostStatus } from '@/entities/post/model/types'

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  DRAFT: 'Szkic',
  PENDING: 'Oczekuje',
  APPROVED: 'Opublikowany',
  REJECTED: 'Odrzucony',
}

export const POST_STATUS_DESCRIPTIONS: Record<PostStatus, string> = {
  DRAFT: 'Post jest prywatny i nie został wysłany do moderacji.',
  PENDING: 'Post czeka na moderację.',
  APPROVED: 'Post jest widoczny publicznie.',
  REJECTED: 'Post wymaga poprawek przed publikacją.',
}
