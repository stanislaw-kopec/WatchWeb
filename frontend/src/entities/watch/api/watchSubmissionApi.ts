import type {
  ModerationWatchSubmission,
  UserWatchSubmission,
  WatchSubmissionResponse,
  WatchSubmissionStatus,
} from '@/entities/watch/model/submissionTypes'
import type { MovementType, Watch } from '@/entities/watch/model/types'
import { httpClient } from '@/shared/api/httpClient'
import type { PageResponse } from '@/shared/api/page'

export type WatchSubmissionModerationListParams = {
  status?: WatchSubmissionStatus
  page?: number
  size?: number
  sort?: string
}

export type WatchSubmissionListParams = {
  status?: WatchSubmissionStatus
  page?: number
  size?: number
  sort?: string
}

export type WatchDetailsSubmissionRequest = {
  movementType: MovementType | null
  caliber: string | null
  caseDiameterMm: number | null
  caseThicknessMm: number | null
  lugToLugMm: number | null
  strapWidthMm: number | null
  waterResistanceM: number | null
  crystalType: string | null
  caseMaterial: string | null
}

export type CreateWatchSubmissionRequest = {
  brand: string
  model: string
  referenceCode: string | null
  details: WatchDetailsSubmissionRequest | null
}

export type RejectWatchSubmissionRequest = {
  reason: string
}

export function getMyWatchSubmissions(params: WatchSubmissionListParams = {}) {
  return getWatchSubmissionPage<UserWatchSubmission>('/api/watch-submissions/me', params)
}

export function createWatchSubmission(request: CreateWatchSubmissionRequest) {
  return httpClient<WatchSubmissionResponse>('/api/watch-submissions', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function getWatchSubmissionModerationQueue(params: WatchSubmissionModerationListParams = {}) {
  return getWatchSubmissionPage<ModerationWatchSubmission>(
    '/api/moderation/watch-submissions',
    params,
  )
}

export function approveWatchSubmission(submissionId: string) {
  return httpClient<Watch>(`/api/moderation/watch-submissions/${submissionId}/approve`, {
    method: 'POST',
  })
}

export function rejectWatchSubmission(submissionId: string, request: RejectWatchSubmissionRequest) {
  return httpClient<WatchSubmissionResponse>(`/api/moderation/watch-submissions/${submissionId}/reject`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

function getWatchSubmissionPage<TSubmission>(
  path: string,
  params: WatchSubmissionListParams | WatchSubmissionModerationListParams = {},
) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return httpClient<PageResponse<TSubmission>>(`${path}${query ? `?${query}` : ''}`)
}
