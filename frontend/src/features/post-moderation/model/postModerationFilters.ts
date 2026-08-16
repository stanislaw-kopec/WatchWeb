import type { PostModerationListParams } from '@/entities/post/api/postApi'
import type { PostStatus } from '@/entities/post/model/types'

export type PostModerationStatusFilter = 'ALL' | PostStatus

export type PostModerationSearchState = {
  status: PostModerationStatusFilter
  page: number
  size: number
}

export const DEFAULT_POST_MODERATION_PAGE_SIZE = 8

export const POST_MODERATION_PAGE_SIZES = [8, 16, 24] as const

const POST_MODERATION_STATUS_VALUES: PostModerationStatusFilter[] = [
  'ALL',
  'PENDING',
  'APPROVED',
  'REJECTED',
]

export function parsePostModerationSearchParams(searchParams: URLSearchParams): PostModerationSearchState {
  const status = searchParams.get('status')

  return {
    status: isPostModerationStatusFilter(status) ? status : 'PENDING',
    page: parsePositiveInteger(searchParams.get('page'), 0),
    size: parsePageSize(searchParams.get('size')),
  }
}

export function toPostModerationListParams(state: PostModerationSearchState): PostModerationListParams {
  return {
    status: state.status === 'ALL' ? undefined : state.status,
    page: state.page,
    size: state.size,
    sort: 'createdAt,desc',
  }
}

export function buildPostModerationSearchParams(
  status: PostModerationStatusFilter,
  page: number,
  size: number,
) {
  const params = new URLSearchParams()

  if (status !== 'PENDING') {
    params.set('status', status)
  }
  if (page > 0) {
    params.set('page', String(page))
  }
  if (size !== DEFAULT_POST_MODERATION_PAGE_SIZE) {
    params.set('size', String(size))
  }

  return params
}

function isPostModerationStatusFilter(value: string | null): value is PostModerationStatusFilter {
  return POST_MODERATION_STATUS_VALUES.includes(value as PostModerationStatusFilter)
}

function parsePageSize(value: string | null) {
  const size = parsePositiveInteger(value, DEFAULT_POST_MODERATION_PAGE_SIZE)

  return POST_MODERATION_PAGE_SIZES.includes(size as (typeof POST_MODERATION_PAGE_SIZES)[number])
    ? size
    : DEFAULT_POST_MODERATION_PAGE_SIZE
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}
