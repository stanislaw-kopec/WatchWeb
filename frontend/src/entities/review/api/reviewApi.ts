import type { Review } from '@/entities/review/model/types'
import { httpClient } from '@/shared/api/httpClient'
import type { PageResponse } from '@/shared/api/page'

export type WatchReviewListParams = {
  page?: number
  size?: number
  sort?: string
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
