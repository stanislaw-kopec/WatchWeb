export type AuthTokens = {
  tokenType: string
  accessToken: string
  refreshToken: string
}

const ACCESS_TOKEN_KEY = 'watchweb.accessToken'
const REFRESH_TOKEN_KEY = 'watchweb.refreshToken'
const TOKEN_TYPE_KEY = 'watchweb.tokenType'

export function getStoredAuthTokens(): AuthTokens | null {
  const accessToken = readStorageValue(ACCESS_TOKEN_KEY)
  const refreshToken = readStorageValue(REFRESH_TOKEN_KEY)
  const tokenType = readStorageValue(TOKEN_TYPE_KEY) ?? 'Bearer'

  if (!accessToken || !refreshToken) {
    return null
  }

  return {
    tokenType,
    accessToken,
    refreshToken,
  }
}

export function saveAuthTokens(tokens: AuthTokens) {
  writeStorageValue(TOKEN_TYPE_KEY, tokens.tokenType)
  writeStorageValue(ACCESS_TOKEN_KEY, tokens.accessToken)
  writeStorageValue(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

export function clearAuthTokens() {
  removeStorageValue(TOKEN_TYPE_KEY)
  removeStorageValue(ACCESS_TOKEN_KEY)
  removeStorageValue(REFRESH_TOKEN_KEY)
}

export function getAuthorizationHeader() {
  const tokens = getStoredAuthTokens()

  return tokens ? `${tokens.tokenType} ${tokens.accessToken}` : null
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
