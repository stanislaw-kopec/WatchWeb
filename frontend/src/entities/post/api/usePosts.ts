import { useQuery } from '@tanstack/react-query'

import { getMyPost, getMyPosts, getPost, getPosts } from '@/entities/post/api/postApi'
import type { MyPostListParams, PostListParams } from '@/entities/post/api/postApi'

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

export function useMyPosts(params: MyPostListParams = {}) {
  return useQuery({
    queryKey: ['my-posts', params],
    queryFn: () => getMyPosts(params),
  })
}

export function useMyPost(postId: string | undefined) {
  return useQuery({
    enabled: Boolean(postId),
    queryKey: ['my-post', postId],
    queryFn: () => getMyPost(postId as string),
  })
}
