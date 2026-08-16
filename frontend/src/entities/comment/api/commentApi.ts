import type { WatchComment } from '@/entities/comment/model/types'
import { httpClient } from '@/shared/api/httpClient'

export function getWatchComments(watchId: string) {
  return httpClient<WatchComment[]>(`/api/watches/${watchId}/comments`)
}
