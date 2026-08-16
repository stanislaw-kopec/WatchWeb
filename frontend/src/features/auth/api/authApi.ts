import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from '@/features/auth/model/types'
import { httpClient } from '@/shared/api/httpClient'

export function login(request: LoginRequest) {
  return httpClient<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function registerUser(request: RegisterRequest) {
  return httpClient<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}

export function logout(refreshToken: string) {
  return httpClient<void>('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}
