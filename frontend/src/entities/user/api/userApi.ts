import type { User } from '@/entities/user/model/types'
import { httpClient } from '@/shared/api/httpClient'

export function getCurrentUser() {
  return httpClient<User>('/api/users/me')
}
