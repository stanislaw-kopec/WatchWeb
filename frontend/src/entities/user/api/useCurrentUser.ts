import { useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '@/entities/user/api/userApi'

export function useCurrentUser(enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
  })
}
