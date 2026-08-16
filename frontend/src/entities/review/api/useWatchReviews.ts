import { useQuery } from '@tanstack/react-query'

import { getMyReviews, getWatchReviews } from '@/entities/review/api/reviewApi'
import type { UserReviewListParams, WatchReviewListParams } from '@/entities/review/api/reviewApi'

export function useWatchReviews(watchId: string | undefined, params: WatchReviewListParams = {}) {
  return useQuery({
    enabled: Boolean(watchId),
    queryKey: ['watch-reviews', watchId, params],
    queryFn: () => getWatchReviews(watchId as string, params),
  })
}

export function useMyReviews(params: UserReviewListParams = {}) {
  return useQuery({
    queryKey: ['my-reviews', params],
    queryFn: () => getMyReviews(params),
  })
}
