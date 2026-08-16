import { useQuery } from '@tanstack/react-query'

import { getArticle, getArticles } from '@/entities/article/api/articleApi'
import type { ArticleListParams } from '@/entities/article/api/articleApi'

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
