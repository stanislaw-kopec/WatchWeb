import type { UserReviewListParams } from '@/entities/review/api/reviewApi'

export type MyReviewListSearchState = {
  page: number
  size: number
}

export const DEFAULT_MY_REVIEW_PAGE_SIZE = 8

export const MY_REVIEW_PAGE_SIZES = [8, 16, 24] as const

export function parseMyReviewListSearchParams(searchParams: URLSearchParams): MyReviewListSearchState {
  return {
    page: parsePositiveInteger(searchParams.get('page'), 0),
    size: parsePageSize(searchParams.get('size')),
  }
}

export function toMyReviewListParams(state: MyReviewListSearchState): UserReviewListParams {
  return {
    page: state.page,
    size: state.size,
    sort: 'createdAt,desc',
  }
}

export function buildMyReviewListSearchParams(page: number, size: number) {
  const params = new URLSearchParams()

  if (page > 0) {
    params.set('page', String(page))
  }
  if (size !== DEFAULT_MY_REVIEW_PAGE_SIZE) {
    params.set('size', String(size))
  }

  return params
}

function parsePageSize(value: string | null) {
  const size = parsePositiveInteger(value, DEFAULT_MY_REVIEW_PAGE_SIZE)

  return MY_REVIEW_PAGE_SIZES.includes(size as (typeof MY_REVIEW_PAGE_SIZES)[number])
    ? size
    : DEFAULT_MY_REVIEW_PAGE_SIZE
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}
