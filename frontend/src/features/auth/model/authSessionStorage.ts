import type { User } from '@/entities/user/model/types'
import type { AuthSession } from '@/features/auth/model/authSessionContext'
import type { AuthResponse } from '@/features/auth/model/types'
import {
  clearAuthTokens,
  getStoredAuthTokens,
  saveAuthTokens,
} from '@/shared/api/authTokenStorage'

const USER_KEY = 'watchweb.user'

export function getStoredAuthSession(): AuthSession | null {
  const tokens = getStoredAuthTokens()
  const user = getStoredUser()

  if (!tokens || !user) {
    return null
  }

  return {
    ...tokens,
    user,
  }
}

export function saveAuthSession(response: AuthResponse) {
  saveAuthTokens({
    tokenType: response.tokenType,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  })
  writeStorageValue(USER_KEY, JSON.stringify(response.user))
}

export function clearAuthSession() {
  clearAuthTokens()
  removeStorageValue(USER_KEY)
}

function getStoredUser(): User | null {
  const rawUser = readStorageValue(USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser) as User
  } catch {
    return null
  }
}

function readStorageValue(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorageValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignore unavailable storage, for example in restrictive browser modes.
  }
}

function removeStorageValue(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore unavailable storage, for example in restrictive browser modes.
  }
}
