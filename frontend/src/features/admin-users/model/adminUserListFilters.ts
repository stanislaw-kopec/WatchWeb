import type { AdminUserListParams } from '@/entities/user/api/userApi'

export type AdminUserListSearchState = {
  page: number
  size: number
}

export const DEFAULT_ADMIN_USER_PAGE_SIZE = 10

export const ADMIN_USER_PAGE_SIZES = [10, 20, 50] as const

export function parseAdminUserListSearchParams(searchParams: URLSearchParams): AdminUserListSearchState {
  return {
    page: parsePositiveInteger(searchParams.get('page'), 0),
    size: parsePageSize(searchParams.get('size')),
  }
}

export function toAdminUserListParams(state: AdminUserListSearchState): AdminUserListParams {
  return {
    page: state.page,
    size: state.size,
    sort: 'createdAt,desc',
  }
}

export function buildAdminUserListSearchParams(page: number, size: number) {
  const params = new URLSearchParams()

  if (page > 0) {
    params.set('page', String(page))
  }
  if (size !== DEFAULT_ADMIN_USER_PAGE_SIZE) {
    params.set('size', String(size))
  }

  return params
}

function parsePageSize(value: string | null) {
  const size = parsePositiveInteger(value, DEFAULT_ADMIN_USER_PAGE_SIZE)

  return ADMIN_USER_PAGE_SIZES.includes(size as (typeof ADMIN_USER_PAGE_SIZES)[number])
    ? size
    : DEFAULT_ADMIN_USER_PAGE_SIZE
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}
