import { useQuery } from '@tanstack/react-query'

import { getWatch, getWatches } from '@/entities/watch/api/watchApi'
import type { WatchListParams } from '@/entities/watch/api/watchApi'

export function useWatches(params: WatchListParams = {}) {
  return useQuery({
    queryKey: ['watches', params],
    queryFn: () => getWatches(params),
  })
}

export function useWatch(watchId: string | undefined) {
  return useQuery({
    enabled: Boolean(watchId),
    queryKey: ['watch', watchId],
    queryFn: () => getWatch(watchId as string),
  })
}
