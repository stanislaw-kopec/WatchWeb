import type { PostComment, WatchComment } from '@/entities/comment/model/types'
import { httpClient } from '@/shared/api/httpClient'

export type CreateWatchCommentRequest = {
  parentId: string | null
  content: string
}

export type CreatePostCommentRequest = {
  parentId: string | null
  content: string
}

export function getWatchComments(watchId: string) {
  return httpClient<WatchComment[]>(`/api/watches/${watchId}/comments`)
}

export function createWatchComment(watchId: string, request: CreateWatchCommentRequest) {
  return httpClient<WatchComment>(`/api/watches/${watchId}/comments`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function deleteWatchComment(watchId: string, commentId: string) {
  return httpClient<void>(`/api/watches/${watchId}/comments/${commentId}`, {
    method: 'DELETE',
  })
}

export function getPostComments(postId: string) {
  return httpClient<PostComment[]>(`/api/posts/${postId}/comments`)
}

export function createPostComment(postId: string, request: CreatePostCommentRequest) {
  return httpClient<PostComment>(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function deletePostComment(postId: string, commentId: string) {
  return httpClient<void>(`/api/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
  })
}
