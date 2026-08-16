import type { Article } from '@/entities/article/model/types'
import { httpClient } from '@/shared/api/httpClient'
import type { PageResponse } from '@/shared/api/page'

export type ArticleListParams = {
  query?: string
  page?: number
  size?: number
  sort?: string
}

export function getArticles(params: ArticleListParams = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return httpClient<PageResponse<Article>>(`/api/articles${query ? `?${query}` : ''}`)
}

export function getArticle(articleId: string) {
  return httpClient<Article>(`/api/articles/${articleId}`)
}
