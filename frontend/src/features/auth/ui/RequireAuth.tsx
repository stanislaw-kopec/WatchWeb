import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router'

import { useAuthSession } from '@/features/auth/model/useAuthSession'

export function RequireAuth({ children }: PropsWithChildren) {
  const location = useLocation()
  const { isAuthenticated } = useAuthSession()

  if (!isAuthenticated) {
    return <Navigate replace to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`} />
  }

  return children
}
