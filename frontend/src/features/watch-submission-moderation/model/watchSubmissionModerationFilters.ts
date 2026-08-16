import type { WatchSubmissionModerationListParams } from '@/entities/watch/api/watchSubmissionApi'
import type { WatchSubmissionStatus } from '@/entities/watch/model/submissionTypes'

export type WatchSubmissionModerationStatusFilter = 'ALL' | WatchSubmissionStatus

export type WatchSubmissionModerationSearchState = {
  status: WatchSubmissionModerationStatusFilter
  page: number
  size: number
}

export const DEFAULT_WATCH_SUBMISSION_MODERATION_PAGE_SIZE = 8

export const WATCH_SUBMISSION_MODERATION_PAGE_SIZES = [8, 16, 24] as const

const WATCH_SUBMISSION_MODERATION_STATUS_VALUES: WatchSubmissionModerationStatusFilter[] = [
  'ALL',
  'PENDING',
  'APPROVED',
  'REJECTED',
]

export function parseWatchSubmissionModerationSearchParams(
  searchParams: URLSearchParams,
): WatchSubmissionModerationSearchState {
  const status = searchParams.get('status')

  return {
    status: isWatchSubmissionModerationStatusFilter(status) ? status : 'PENDING',
    page: parsePositiveInteger(searchParams.get('page'), 0),
    size: parsePageSize(searchParams.get('size')),
  }
}

export function toWatchSubmissionModerationListParams(
  state: WatchSubmissionModerationSearchState,
): WatchSubmissionModerationListParams {
  return {
    status: state.status === 'ALL' ? undefined : state.status,
    page: state.page,
    size: state.size,
    sort: 'createdAt,desc',
  }
}

export function buildWatchSubmissionModerationSearchParams(
  status: WatchSubmissionModerationStatusFilter,
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
  if (size !== DEFAULT_WATCH_SUBMISSION_MODERATION_PAGE_SIZE) {
    params.set('size', String(size))
  }

  return params
}

function isWatchSubmissionModerationStatusFilter(
  value: string | null,
): value is WatchSubmissionModerationStatusFilter {
  return WATCH_SUBMISSION_MODERATION_STATUS_VALUES.includes(value as WatchSubmissionModerationStatusFilter)
}

function parsePageSize(value: string | null) {
  const size = parsePositiveInteger(value, DEFAULT_WATCH_SUBMISSION_MODERATION_PAGE_SIZE)

  return WATCH_SUBMISSION_MODERATION_PAGE_SIZES.includes(
    size as (typeof WATCH_SUBMISSION_MODERATION_PAGE_SIZES)[number],
  )
    ? size
    : DEFAULT_WATCH_SUBMISSION_MODERATION_PAGE_SIZE
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}
