import type { Article } from '@/entities/article/model/types'
import { httpClient } from '@/shared/api/httpClient'
import type { PageResponse } from '@/shared/api/page'

export type ArticleListParams = {
  query?: string
  page?: number
  size?: number
  sort?: string
}

export type CreateArticleRequest = {
  title: string
  content: string
}

export type UpdateArticleRequest = CreateArticleRequest

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

export function createArticle(request: CreateArticleRequest) {
  return httpClient<Article>('/api/articles', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function updateArticle(articleId: string, request: UpdateArticleRequest) {
  return httpClient<Article>(`/api/articles/${articleId}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function updateArticleHeaderImage(articleId: string, file: File) {
  const formData = new FormData()
  formData.set('file', file)

  return httpClient<Article>(`/api/articles/${articleId}/header-image`, {
    method: 'PUT',
    body: formData,
  })
}

export function deleteArticle(articleId: string) {
  return httpClient<void>(`/api/articles/${articleId}`, {
    method: 'DELETE',
  })
}
