import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'

import { logout, refreshAuthToken } from '@/features/auth/api/authApi'
import { AuthSessionContext } from '@/features/auth/model/authSessionContext'
import type { AuthSession } from '@/features/auth/model/authSessionContext'
import type { AuthResponse } from '@/features/auth/model/types'
import {
  clearAuthSession,
  getStoredAuthSession,
  saveAuthUser,
  saveAuthSession,
} from '@/features/auth/model/authSessionStorage'
import { setAuthRefreshHandler } from '@/shared/api/httpClient'

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

  const updateUser = useCallback((user: AuthSession['user']) => {
    saveAuthUser(user)
    setSession((currentSession) =>
      currentSession
        ? {
            ...currentSession,
            user,
          }
        : currentSession,
    )
  }, [])

  const refreshSession = useCallback(async () => {
    const refreshToken = session?.refreshToken

    if (!refreshToken) {
      clearAuthSession()
      setSession(null)
      return false
    }

    try {
      const response = await refreshAuthToken(refreshToken)
      signIn(response)
      return true
    } catch {
      clearAuthSession()
      setSession(null)
      return false
    }
  }, [session?.refreshToken, signIn])

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

  useEffect(() => {
    setAuthRefreshHandler(refreshSession)

    return () => setAuthRefreshHandler(null)
  }, [refreshSession])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      signIn,
      updateUser,
      signOut,
      refreshSession,
    }),
    [refreshSession, session, signIn, signOut, updateUser],
  )

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
}
