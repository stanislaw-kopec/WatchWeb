import type { MyArticleListParams } from '@/entities/article/api/articleApi'
import type { ArticleStatus } from '@/entities/article/model/types'

export type MyArticleStatusFilter = 'ALL' | ArticleStatus

export type MyArticleListSearchState = {
  status: MyArticleStatusFilter
  page: number
  size: number
}

export const DEFAULT_MY_ARTICLE_PAGE_SIZE = 8
const ARTICLE_STATUS_FILTER_VALUES: MyArticleStatusFilter[] = ['ALL', 'DRAFT', 'PUBLISHED']

export function parseMyArticleListSearchParams(searchParams: URLSearchParams): MyArticleListSearchState {
  const status = searchParams.get('status')

  return {
    status: ARTICLE_STATUS_FILTER_VALUES.includes(status as MyArticleStatusFilter)
      ? status as MyArticleStatusFilter
      : 'ALL',
    page: parsePositiveInteger(searchParams.get('page'), 0),
    size: parsePositiveInteger(searchParams.get('size'), DEFAULT_MY_ARTICLE_PAGE_SIZE),
  }
}

export function toMyArticleListParams(state: MyArticleListSearchState): MyArticleListParams {
  return {
    status: state.status === 'ALL' ? undefined : state.status,
    page: state.page,
    size: state.size,
    sort: 'updatedAt,desc',
  }
}

export function buildMyArticleListSearchParams(status: MyArticleStatusFilter, page: number, size: number) {
  const params = new URLSearchParams()
  if (status !== 'ALL') {
    params.set('status', status)
  }
  if (page > 0) {
    params.set('page', String(page))
  }
  if (size !== DEFAULT_MY_ARTICLE_PAGE_SIZE) {
    params.set('size', String(size))
  }
  return params
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}
