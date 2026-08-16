import type { Post, PostStatus } from '@/entities/post/model/types'
import { httpClient } from '@/shared/api/httpClient'
import type { PageResponse } from '@/shared/api/page'

export type PostListParams = {
  query?: string
  hashtag?: string
  page?: number
  size?: number
  sort?: string
}

export type MyPostListParams = {
  status?: PostStatus
  page?: number
  size?: number
  sort?: string
}

export type PostModerationListParams = {
  status?: PostStatus
  page?: number
  size?: number
  sort?: string
}

export type CreatePostRequest = {
  title: string
  content: string
  hashtags: string[]
}

export type UpdatePostRequest = CreatePostRequest

export type RejectPostRequest = {
  reason: string
}

export function getPosts(params: PostListParams = {}) {
  return getPostPage('/api/posts', params)
}

export function getMyPosts(params: MyPostListParams = {}) {
  return getPostPage('/api/posts/me', params)
}

export function getPostModerationQueue(params: PostModerationListParams = {}) {
  return getPostPage('/api/moderation/posts', params)
}

export function getPost(postId: string) {
  return httpClient<Post>(`/api/posts/${postId}`)
}

export function createPost(request: CreatePostRequest) {
  return httpClient<Post>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updatePost(postId: string, request: UpdatePostRequest) {
  return httpClient<Post>(`/api/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function updatePostImage(postId: string, file: File) {
  const formData = new FormData()
  formData.set('file', file)

  return httpClient<Post>(`/api/posts/${postId}/image`, {
    method: 'PUT',
    body: formData,
  })
}

export function deletePost(postId: string) {
  return httpClient<void>(`/api/posts/${postId}`, {
    method: 'DELETE',
  })
}

export function approvePost(postId: string) {
  return httpClient<Post>(`/api/moderation/posts/${postId}/approve`, {
    method: 'POST',
  })
}

export function rejectPost(postId: string, request: RejectPostRequest) {
  return httpClient<Post>(`/api/moderation/posts/${postId}/reject`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

function getPostPage(
  path: string,
  params: PostListParams | MyPostListParams | PostModerationListParams = {},
) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return httpClient<PageResponse<Post>>(`${path}${query ? `?${query}` : ''}`)
}
