import type { User, UserRole } from '@/entities/user/model/types'
import { httpClient } from '@/shared/api/httpClient'
import type { PageResponse } from '@/shared/api/page'

export type AdminUserListParams = {
  page?: number
  size?: number
  sort?: string
}

export type UpdateUserRoleRequest = {
  role: UserRole
}

export type UpdateUserProfileRequest = {
  username: string
  email: string
}

export type UpdatePasswordRequest = {
  currentPassword: string
  newPassword: string
}

export function getCurrentUser() {
  return httpClient<User>('/api/users/me')
}

export function getUser(userId: string) {
  return httpClient<User>(`/api/users/${userId}`)
}

export function updateCurrentUser(request: UpdateUserProfileRequest) {
  return httpClient<User>('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function updateCurrentUserAvatar(file: File) {
  const formData = new FormData()
  formData.set('file', file)

  return httpClient<User>('/api/users/me/avatar', {
    method: 'PUT',
    body: formData,
  })
}

export function updateCurrentUserPassword(request: UpdatePasswordRequest) {
  return httpClient<void>('/api/users/me/password', {
    method: 'PUT',
    body: JSON.stringify(request),
  })
}

export function deleteCurrentUser() {
  return httpClient<User>('/api/users/me', {
    method: 'DELETE',
  })
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
