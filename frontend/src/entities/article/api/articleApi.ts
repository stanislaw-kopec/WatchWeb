import type { Article, ArticleStatus } from '@/entities/article/model/types'
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

export type SaveArticleDraftRequest = CreateArticleRequest

export type MyArticleListParams = {
  status?: ArticleStatus
  page?: number
  size?: number
  sort?: string
}

export type ArticleImageResponse = {
  url: string
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

export function getMyArticles(params: MyArticleListParams = {}) {
  return getArticlePage('/api/articles/me', params)
}

export function getMyArticle(articleId: string) {
  return httpClient<Article>(`/api/articles/me/${articleId}`)
}

export function createArticle(request: CreateArticleRequest) {
  return httpClient<Article>('/api/articles', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function createArticleDraft(request: SaveArticleDraftRequest) {
  return httpClient<Article>('/api/articles/drafts', {
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

export function updateArticleDraft(articleId: string, request: SaveArticleDraftRequest) {
  return httpClient<Article>(`/api/articles/${articleId}/draft`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function publishArticle(articleId: string, request: CreateArticleRequest) {
  return httpClient<Article>(`/api/articles/${articleId}/publish`, {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function uploadArticleContentImage(file: File) {
  const formData = new FormData()
  formData.set('file', file)

  return httpClient<ArticleImageResponse>('/api/articles/content-images', {
    method: 'POST',
    body: formData,
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

function getArticlePage(path: string, params: ArticleListParams | MyArticleListParams = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return httpClient<PageResponse<Article>>(`${path}${query ? `?${query}` : ''}`)
}
