import type { ArticleListParams } from '@/entities/article/api/articleApi'

export type ArticleListSort = 'createdAt,desc' | 'createdAt,asc' | 'title,asc'

export type ArticleListFilters = {
  query: string
  sort: ArticleListSort
}

export type ArticleListSearchState = ArticleListFilters & {
  page: number
  size: number
}

export const DEFAULT_ARTICLE_PAGE_SIZE = 8

export const ARTICLE_PAGE_SIZES = [8, 16, 24] as const

export const ARTICLE_SORT_OPTIONS: Array<{ value: ArticleListSort; label: string }> = [
  { value: 'createdAt,desc', label: 'Najnowsze' },
  { value: 'createdAt,asc', label: 'Najstarsze' },
  { value: 'title,asc', label: 'Tytuł A-Z' },
]

export const DEFAULT_ARTICLE_FILTERS: ArticleListFilters = {
  query: '',
  sort: 'createdAt,desc',
}

const articleSortValues = ARTICLE_SORT_OPTIONS.map((option) => option.value)

export function parseArticleListSearchParams(searchParams: URLSearchParams): ArticleListSearchState {
  const sort = searchParams.get('sort')

  return {
    query: searchParams.get('query') ?? '',
    sort: isArticleListSort(sort) ? sort : DEFAULT_ARTICLE_FILTERS.sort,
    page: parsePositiveInteger(searchParams.get('page'), 0),
    size: parsePageSize(searchParams.get('size')),
  }
}

export function toArticleListParams(state: ArticleListSearchState): ArticleListParams {
  return {
    query: state.query.trim() || undefined,
    page: state.page,
    size: state.size,
    sort: state.sort,
  }
}

export function buildArticleListSearchParams(filters: ArticleListFilters, page: number, size: number) {
  const params = new URLSearchParams()
  const normalizedQuery = filters.query.trim()

  if (normalizedQuery) {
    params.set('query', normalizedQuery)
  }
  if (filters.sort !== DEFAULT_ARTICLE_FILTERS.sort) {
    params.set('sort', filters.sort)
  }
  if (page > 0) {
    params.set('page', String(page))
  }
  if (size !== DEFAULT_ARTICLE_PAGE_SIZE) {
    params.set('size', String(size))
  }

  return params
}

export function countActiveArticleFilters(filters: ArticleListFilters) {
  return filters.query.trim() ? 1 : 0
}

function isArticleListSort(value: string | null): value is ArticleListSort {
  return articleSortValues.includes(value as ArticleListSort)
}

function parsePageSize(value: string | null) {
  const size = parsePositiveInteger(value, DEFAULT_ARTICLE_PAGE_SIZE)

  return ARTICLE_PAGE_SIZES.includes(size as (typeof ARTICLE_PAGE_SIZES)[number])
    ? size
    : DEFAULT_ARTICLE_PAGE_SIZE
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}
