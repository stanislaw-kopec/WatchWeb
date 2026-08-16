import { ApiError } from '@/shared/api/apiError'
import { getAuthorizationHeader } from '@/shared/api/authTokenStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export type HttpClientOptions = RequestInit & {
  skipAuth?: boolean
  skipAuthRefresh?: boolean
}

type AuthRefreshHandler = () => Promise<boolean>

let authRefreshHandler: AuthRefreshHandler | null = null

export function setAuthRefreshHandler(handler: AuthRefreshHandler | null) {
  authRefreshHandler = handler
}

export async function httpClient<TResponse>(path: string, options: HttpClientOptions = {}) {
  const response = await sendRequest(path, options)

  if (response.status === 401 && !options.skipAuthRefresh && authRefreshHandler) {
    const refreshed = await authRefreshHandler()

    if (refreshed) {
      return handleResponse<TResponse>(await sendRequest(path, options))
    }
  }

  return handleResponse<TResponse>(response)
}

async function sendRequest(path: string, options: HttpClientOptions) {
  const fetchOptions = { ...options }

  delete fetchOptions.skipAuth
  delete fetchOptions.skipAuthRefresh

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: createHeaders(options),
  })

  return response
}

async function handleResponse<TResponse>(response: Response) {
  if (!response.ok) {
    throw await ApiError.fromResponse(response)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return (await response.json()) as TResponse
}

function createHeaders(options: HttpClientOptions) {
  const headers = new Headers(options.headers)
  const authorization = options.skipAuth ? null : getAuthorizationHeader()

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
