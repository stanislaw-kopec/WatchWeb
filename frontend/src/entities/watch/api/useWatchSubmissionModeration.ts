import { useQuery } from '@tanstack/react-query'

import { getWatchSubmissionModerationQueue } from '@/entities/watch/api/watchSubmissionApi'
import type { WatchSubmissionModerationListParams } from '@/entities/watch/api/watchSubmissionApi'

export function useWatchSubmissionModerationQueue(
  params: WatchSubmissionModerationListParams = {},
) {
  return useQuery({
    queryKey: ['watch-submission-moderation', params],
    queryFn: () => getWatchSubmissionModerationQueue(params),
  })
}
