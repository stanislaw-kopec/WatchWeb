import { useQuery } from '@tanstack/react-query'

import { getArticle, getArticles, getMyArticle, getMyArticles } from '@/entities/article/api/articleApi'
import type { ArticleListParams, MyArticleListParams } from '@/entities/article/api/articleApi'

export function useArticles(params: ArticleListParams = {}) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => getArticles(params),
  })
}

export function useArticle(articleId: string | undefined) {
  return useQuery({
    enabled: Boolean(articleId),
    queryKey: ['article', articleId],
    queryFn: () => getArticle(articleId as string),
  })
}

export function useMyArticles(params: MyArticleListParams = {}) {
  return useQuery({
    queryKey: ['my-articles', params],
    queryFn: () => getMyArticles(params),
  })
}

export function useMyArticle(articleId: string | undefined) {
  return useQuery({
    enabled: Boolean(articleId),
    queryKey: ['my-article', articleId],
    queryFn: () => getMyArticle(articleId as string),
  })
}
