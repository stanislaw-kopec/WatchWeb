import { ApiError } from '@/shared/api/apiError'
import { getAuthorizationHeader } from '@/shared/api/authTokenStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function httpClient<TResponse>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: createHeaders(options),
  })

  if (!response.ok) {
    throw await ApiError.fromResponse(response)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return (await response.json()) as TResponse
}

function createHeaders(options: RequestInit) {
  const headers = new Headers(options.headers)
  const authorization = getAuthorizationHeader()

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (authorization && !headers.has('Authorization')) {
    headers.set('Authorization', authorization)
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return headers
}
