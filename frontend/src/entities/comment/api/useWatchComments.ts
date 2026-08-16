import { useQuery } from '@tanstack/react-query'

import { getWatchComments } from '@/entities/comment/api/commentApi'

export function useWatchComments(watchId: string | undefined) {
  return useQuery({
    enabled: Boolean(watchId),
    queryKey: ['watch-comments', watchId],
    queryFn: () => getWatchComments(watchId as string),
  })
}
