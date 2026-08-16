import type { WatchComment } from '@/entities/comment/model/types'
import { httpClient } from '@/shared/api/httpClient'

export type CreateWatchCommentRequest = {
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
