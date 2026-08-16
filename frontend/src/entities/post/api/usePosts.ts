import { useQuery } from '@tanstack/react-query'

import { getPost, getPosts } from '@/entities/post/api/postApi'
import type { PostListParams } from '@/entities/post/api/postApi'

export function usePosts(params: PostListParams = {}) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => getPosts(params),
  })
}

export function usePost(postId: string | undefined) {
  return useQuery({
    enabled: Boolean(postId),
    queryKey: ['post', postId],
    queryFn: () => getPost(postId as string),
  })
}
