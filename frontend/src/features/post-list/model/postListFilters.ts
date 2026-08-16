import type { PostListParams } from '@/entities/post/api/postApi'

export type PostListSort = 'createdAt,desc' | 'createdAt,asc' | 'title,asc'

export type PostListFilters = {
  query: string
  hashtag: string
  sort: PostListSort
}

export type PostListSearchState = PostListFilters & {
  page: number
  size: number
}

export const DEFAULT_POST_PAGE_SIZE = 8

export const POST_PAGE_SIZES = [8, 16, 24] as const

export const POST_SORT_OPTIONS: Array<{ value: PostListSort; label: string }> = [
  { value: 'createdAt,desc', label: 'Najnowsze' },
  { value: 'createdAt,asc', label: 'Najstarsze' },
  { value: 'title,asc', label: 'Tytuł A-Z' },
]

export const DEFAULT_POST_FILTERS: PostListFilters = {
  query: '',
  hashtag: '',
  sort: 'createdAt,desc',
}

const postSortValues = POST_SORT_OPTIONS.map((option) => option.value)

export function parsePostListSearchParams(searchParams: URLSearchParams): PostListSearchState {
  const sort = searchParams.get('sort')

  return {
    query: searchParams.get('query') ?? '',
    hashtag: normalizeHashtag(searchParams.get('hashtag') ?? ''),
    sort: isPostListSort(sort) ? sort : DEFAULT_POST_FILTERS.sort,
    page: parsePositiveInteger(searchParams.get('page'), 0),
    size: parsePageSize(searchParams.get('size')),
  }
}

export function toPostListParams(state: PostListSearchState): PostListParams {
  return {
    query: state.query.trim() || undefined,
    hashtag: normalizeHashtag(state.hashtag) || undefined,
    page: state.page,
    size: state.size,
    sort: state.sort,
  }
}

export function buildPostListSearchParams(filters: PostListFilters, page: number, size: number) {
  const params = new URLSearchParams()
  const normalizedQuery = filters.query.trim()
  const normalizedHashtag = normalizeHashtag(filters.hashtag)

  if (normalizedQuery) {
    params.set('query', normalizedQuery)
  }
  if (normalizedHashtag) {
    params.set('hashtag', normalizedHashtag)
  }
  if (filters.sort !== DEFAULT_POST_FILTERS.sort) {
    params.set('sort', filters.sort)
  }
  if (page > 0) {
    params.set('page', String(page))
  }
  if (size !== DEFAULT_POST_PAGE_SIZE) {
    params.set('size', String(size))
  }

  return params
}

export function countActivePostFilters(filters: PostListFilters) {
  return Number(Boolean(filters.query.trim())) + Number(Boolean(normalizeHashtag(filters.hashtag)))
}

function isPostListSort(value: string | null): value is PostListSort {
  return postSortValues.includes(value as PostListSort)
}

function parsePageSize(value: string | null) {
  const size = parsePositiveInteger(value, DEFAULT_POST_PAGE_SIZE)

  return POST_PAGE_SIZES.includes(size as (typeof POST_PAGE_SIZES)[number])
    ? size
    : DEFAULT_POST_PAGE_SIZE
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}

function normalizeHashtag(value: string) {
  return value.trim().replace(/^#/, '').toLowerCase()
}
