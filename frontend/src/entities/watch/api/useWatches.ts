import { useQuery } from '@tanstack/react-query'

import { getWatches } from '@/entities/watch/api/watchApi'
import type { WatchListParams } from '@/entities/watch/api/watchApi'

export function useWatches(params: WatchListParams = {}) {
  return useQuery({
    queryKey: ['watches', params],
    queryFn: () => getWatches(params),
  })
}
