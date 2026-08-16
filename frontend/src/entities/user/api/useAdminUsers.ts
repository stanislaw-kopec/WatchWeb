import { useQuery } from '@tanstack/react-query'

import { getAdminUsers } from '@/entities/user/api/userApi'
import type { AdminUserListParams } from '@/entities/user/api/userApi'

export function useAdminUsers(params: AdminUserListParams = {}) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => getAdminUsers(params),
  })
}
