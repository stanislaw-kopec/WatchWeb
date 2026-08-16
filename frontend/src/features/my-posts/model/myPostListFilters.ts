import type { MyPostListParams } from '@/entities/post/api/postApi'
import type { PostStatus } from '@/entities/post/model/types'

export type MyPostStatusFilter = 'ALL' | PostStatus

export type MyPostListSearchState = {
  status: MyPostStatusFilter
  page: number
  size: number
}

export const DEFAULT_MY_POST_PAGE_SIZE = 8

export const MY_POST_PAGE_SIZES = [8, 16, 24] as const

const POST_STATUS_FILTER_VALUES: MyPostStatusFilter[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']

export function parseMyPostListSearchParams(searchParams: URLSearchParams): MyPostListSearchState {
  const status = searchParams.get('status')

  return {
    status: isMyPostStatusFilter(status) ? status : 'ALL',
    page: parsePositiveInteger(searchParams.get('page'), 0),
    size: parsePageSize(searchParams.get('size')),
  }
}

export function toMyPostListParams(state: MyPostListSearchState): MyPostListParams {
  return {
    status: state.status === 'ALL' ? undefined : state.status,
    page: state.page,
    size: state.size,
    sort: 'createdAt,desc',
  }
}

export function buildMyPostListSearchParams(
  status: MyPostStatusFilter,
  page: number,
  size: number,
) {
  const params = new URLSearchParams()

  if (status !== 'ALL') {
    params.set('status', status)
  }
  if (page > 0) {
    params.set('page', String(page))
  }
  if (size !== DEFAULT_MY_POST_PAGE_SIZE) {
    params.set('size', String(size))
  }

  return params
}

function isMyPostStatusFilter(value: string | null): value is MyPostStatusFilter {
  return POST_STATUS_FILTER_VALUES.includes(value as MyPostStatusFilter)
}

function parsePageSize(value: string | null) {
  const size = parsePositiveInteger(value, DEFAULT_MY_POST_PAGE_SIZE)

  return MY_POST_PAGE_SIZES.includes(size as (typeof MY_POST_PAGE_SIZES)[number])
    ? size
    : DEFAULT_MY_POST_PAGE_SIZE
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}
