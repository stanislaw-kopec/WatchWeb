import type { Post } from '@/entities/post/model/types'
import { httpClient } from '@/shared/api/httpClient'
import type { PageResponse } from '@/shared/api/page'

export type PostListParams = {
  query?: string
  hashtag?: string
  page?: number
  size?: number
  sort?: string
}

export function getPosts(params: PostListParams = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return httpClient<PageResponse<Post>>(`/api/posts${query ? `?${query}` : ''}`)
}

export function getPost(postId: string) {
  return httpClient<Post>(`/api/posts/${postId}`)
}
