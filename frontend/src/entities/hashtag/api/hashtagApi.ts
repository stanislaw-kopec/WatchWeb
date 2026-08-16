import type { Hashtag } from '@/entities/hashtag/model/types'
import { httpClient } from '@/shared/api/httpClient'
import type { PageResponse } from '@/shared/api/page'

export type HashtagListParams = {
  query?: string
  page?: number
  size?: number
  sort?: string
}

export function getHashtags(params: HashtagListParams = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return httpClient<PageResponse<Hashtag>>(`/api/hashtags${query ? `?${query}` : ''}`)
}
