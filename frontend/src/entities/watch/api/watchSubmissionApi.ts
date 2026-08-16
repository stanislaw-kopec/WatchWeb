import type {
  ModerationWatchSubmission,
  WatchSubmissionResponse,
  WatchSubmissionStatus,
} from '@/entities/watch/model/submissionTypes'
import type { Watch } from '@/entities/watch/model/types'
import { httpClient } from '@/shared/api/httpClient'
import type { PageResponse } from '@/shared/api/page'

export type WatchSubmissionModerationListParams = {
  status?: WatchSubmissionStatus
  page?: number
  size?: number
  sort?: string
}

export type RejectWatchSubmissionRequest = {
  reason: string
}

export function getWatchSubmissionModerationQueue(params: WatchSubmissionModerationListParams = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return httpClient<PageResponse<ModerationWatchSubmission>>(
    `/api/moderation/watch-submissions${query ? `?${query}` : ''}`,
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
