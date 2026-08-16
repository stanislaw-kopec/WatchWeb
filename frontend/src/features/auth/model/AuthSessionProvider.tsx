import { useCallback, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'

import { logout } from '@/features/auth/api/authApi'
import { AuthSessionContext } from '@/features/auth/model/authSessionContext'
import type { AuthSession } from '@/features/auth/model/authSessionContext'
import type { AuthResponse } from '@/features/auth/model/types'
import {
  clearAuthSession,
  getStoredAuthSession,
  saveAuthSession,
} from '@/features/auth/model/authSessionStorage'

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredAuthSession())

  const signIn = useCallback((response: AuthResponse) => {
    const nextSession = {
      tokenType: response.tokenType,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
    }

    saveAuthSession(response)
    setSession(nextSession)
  }, [])

  const signOut = useCallback(async () => {
    const refreshToken = session?.refreshToken

    clearAuthSession()
    setSession(null)

    if (refreshToken) {
      try {
        await logout(refreshToken)
      } catch {
        // Local logout should still succeed when the refresh token is already invalid.
      }
    }
  }, [session?.refreshToken])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      signIn,
      signOut,
    }),
    [session, signIn, signOut],
  )

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
}
