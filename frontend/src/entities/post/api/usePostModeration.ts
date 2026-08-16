import { useQuery } from '@tanstack/react-query'

import { getPostModerationQueue } from '@/entities/post/api/postApi'
import type { PostModerationListParams } from '@/entities/post/api/postApi'

export function usePostModerationQueue(params: PostModerationListParams = {}) {
  return useQuery({
    queryKey: ['post-moderation', params],
    queryFn: () => getPostModerationQueue(params),
  })
}
