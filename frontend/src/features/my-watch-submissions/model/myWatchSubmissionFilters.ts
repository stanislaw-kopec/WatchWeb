import type { WatchSubmissionListParams } from '@/entities/watch/api/watchSubmissionApi'
import type { WatchSubmissionStatus } from '@/entities/watch/model/submissionTypes'

export type MyWatchSubmissionStatusFilter = 'ALL' | WatchSubmissionStatus

export type MyWatchSubmissionSearchState = {
  status: MyWatchSubmissionStatusFilter
  page: number
  size: number
}

export const DEFAULT_MY_WATCH_SUBMISSION_PAGE_SIZE = 8

export const MY_WATCH_SUBMISSION_PAGE_SIZES = [8, 16, 24] as const

const WATCH_SUBMISSION_STATUS_FILTER_VALUES: MyWatchSubmissionStatusFilter[] = [
  'ALL',
  'PENDING',
  'APPROVED',
  'REJECTED',
]

export function parseMyWatchSubmissionSearchParams(
  searchParams: URLSearchParams,
): MyWatchSubmissionSearchState {
  const status = searchParams.get('status')

  return {
    status: isMyWatchSubmissionStatusFilter(status) ? status : 'ALL',
    page: parsePositiveInteger(searchParams.get('page'), 0),
    size: parsePageSize(searchParams.get('size')),
  }
}

export function toMyWatchSubmissionListParams(
  state: MyWatchSubmissionSearchState,
): WatchSubmissionListParams {
  return {
    status: state.status === 'ALL' ? undefined : state.status,
    page: state.page,
    size: state.size,
    sort: 'createdAt,desc',
  }
}

export function buildMyWatchSubmissionSearchParams(
  status: MyWatchSubmissionStatusFilter,
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
  if (size !== DEFAULT_MY_WATCH_SUBMISSION_PAGE_SIZE) {
    params.set('size', String(size))
  }

  return params
}

function isMyWatchSubmissionStatusFilter(
  value: string | null,
): value is MyWatchSubmissionStatusFilter {
  return WATCH_SUBMISSION_STATUS_FILTER_VALUES.includes(value as MyWatchSubmissionStatusFilter)
}

function parsePageSize(value: string | null) {
  const size = parsePositiveInteger(value, DEFAULT_MY_WATCH_SUBMISSION_PAGE_SIZE)

  return MY_WATCH_SUBMISSION_PAGE_SIZES.includes(
    size as (typeof MY_WATCH_SUBMISSION_PAGE_SIZES)[number],
  )
    ? size
    : DEFAULT_MY_WATCH_SUBMISSION_PAGE_SIZE
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}
