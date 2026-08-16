import type { User } from '@/entities/user/model/types'

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  username: string
  email: string
  password: string
}

export type AuthResponse = {
  tokenType: string
  accessToken: string
  refreshToken: string
  user: User
}

export type RegisterResponse = {
  user: User
}
