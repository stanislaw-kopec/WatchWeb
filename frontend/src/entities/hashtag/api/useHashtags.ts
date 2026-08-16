import { useQuery } from '@tanstack/react-query'

import { getHashtags } from '@/entities/hashtag/api/hashtagApi'
import type { HashtagListParams } from '@/entities/hashtag/api/hashtagApi'

export function useHashtags(params: HashtagListParams = {}) {
  return useQuery({
    queryKey: ['hashtags', params],
    queryFn: () => getHashtags(params),
    staleTime: 60_000,
  })
}
