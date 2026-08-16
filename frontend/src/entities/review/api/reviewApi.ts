import type { Review } from '@/entities/review/model/types'
import { httpClient } from '@/shared/api/httpClient'
import type { PageResponse } from '@/shared/api/page'

export type WatchReviewListParams = {
  page?: number
  size?: number
  sort?: string
}

export type CreateReviewRequest = {
  rating: number
  content: string
}

export function getWatchReviews(watchId: string, params: WatchReviewListParams = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return httpClient<PageResponse<Review>>(`/api/watches/${watchId}/reviews${query ? `?${query}` : ''}`)
}

export function createWatchReview(watchId: string, request: CreateReviewRequest) {
  return httpClient<Review>(`/api/watches/${watchId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}
