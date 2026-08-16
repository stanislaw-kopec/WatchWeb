import type { Review, UserReview } from '@/entities/review/model/types'
import { httpClient } from '@/shared/api/httpClient'
import type { PageResponse } from '@/shared/api/page'

export type WatchReviewListParams = {
  page?: number
  size?: number
  sort?: string
}

export type UserReviewListParams = {
  page?: number
  size?: number
  sort?: string
}

export type CreateReviewRequest = {
  rating: number
  content: string
}

export type UpdateReviewRequest = CreateReviewRequest

export function getWatchReviews(watchId: string, params: WatchReviewListParams = {}) {
  return getReviewPage<Review>(`/api/watches/${watchId}/reviews`, params)
}

export function getMyReviews(params: UserReviewListParams = {}) {
  return getReviewPage<UserReview>('/api/users/me/reviews', params)
}

export function createWatchReview(watchId: string, request: CreateReviewRequest) {
  return httpClient<Review>(`/api/watches/${watchId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateWatchReview(
  watchId: string,
  reviewId: string,
  request: UpdateReviewRequest,
) {
  return httpClient<Review>(`/api/watches/${watchId}/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteWatchReview(watchId: string, reviewId: string) {
  return httpClient<void>(`/api/watches/${watchId}/reviews/${reviewId}`, {
    method: 'DELETE',
  })
}

function getReviewPage<TReview>(
  path: string,
  params: WatchReviewListParams | UserReviewListParams = {},
) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return httpClient<PageResponse<TReview>>(`${path}${query ? `?${query}` : ''}`)
}
