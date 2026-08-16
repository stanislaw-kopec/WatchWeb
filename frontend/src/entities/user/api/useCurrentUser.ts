import { useQuery } from '@tanstack/react-query'

import { getCurrentUser, getUser } from '@/entities/user/api/userApi'

export function useCurrentUser(enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
  })
}

export function useUser(userId: string | undefined) {
  return useQuery({
    enabled: Boolean(userId),
    queryKey: ['user', userId],
    queryFn: () => getUser(userId as string),
  })
}
