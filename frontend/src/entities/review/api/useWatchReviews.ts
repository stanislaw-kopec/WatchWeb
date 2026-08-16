import { useQuery } from '@tanstack/react-query'

import { getWatchReviews } from '@/entities/review/api/reviewApi'
import type { WatchReviewListParams } from '@/entities/review/api/reviewApi'

export function useWatchReviews(watchId: string | undefined, params: WatchReviewListParams = {}) {
  return useQuery({
    enabled: Boolean(watchId),
    queryKey: ['watch-reviews', watchId, params],
    queryFn: () => getWatchReviews(watchId as string, params),
  })
}
