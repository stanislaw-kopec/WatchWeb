import { useQuery } from '@tanstack/react-query'

import { getPostComments } from '@/entities/comment/api/commentApi'

export function usePostComments(postId: string | undefined) {
  return useQuery({
    enabled: Boolean(postId),
    queryKey: ['post-comments', postId],
    queryFn: () => getPostComments(postId as string),
  })
}
