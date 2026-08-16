import type { User } from '@/entities/user/model/types'
import { httpClient } from '@/shared/api/httpClient'
import type { PageResponse } from '@/shared/api/page'
import type { UserRole } from '@/entities/user/model/types'

export type AdminUserListParams = {
  page?: number
  size?: number
  sort?: string
}

export type UpdateUserRoleRequest = {
  role: UserRole
}

export function getCurrentUser() {
  return httpClient<User>('/api/users/me')
}

export function getAdminUsers(params: AdminUserListParams = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return httpClient<PageResponse<User>>(`/api/admin/users${query ? `?${query}` : ''}`)
}

export function updateUserRole(userId: string, request: UpdateUserRoleRequest) {
  return httpClient<User>(`/api/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}
