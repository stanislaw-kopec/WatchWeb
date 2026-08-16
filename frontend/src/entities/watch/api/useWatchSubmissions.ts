import { useQuery } from '@tanstack/react-query'

import { getMyWatchSubmissions } from '@/entities/watch/api/watchSubmissionApi'
import type { WatchSubmissionListParams } from '@/entities/watch/api/watchSubmissionApi'

export function useMyWatchSubmissions(params: WatchSubmissionListParams = {}) {
  return useQuery({
    queryKey: ['my-watch-submissions', params],
    queryFn: () => getMyWatchSubmissions(params),
  })
}
