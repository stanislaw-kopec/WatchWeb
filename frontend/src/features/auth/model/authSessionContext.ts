import { createContext } from 'react'

import type { User } from '@/entities/user/model/types'
import type { AuthResponse } from '@/features/auth/model/types'

export type AuthSession = {
  tokenType: string
  accessToken: string
  refreshToken: string
  user: User
}

export type AuthSessionContextValue = {
  session: AuthSession | null
  user: User | null
  isAuthenticated: boolean
  signIn: (response: AuthResponse) => void
  updateUser: (user: User) => void
  signOut: () => Promise<void>
  refreshSession: () => Promise<boolean>
}

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)
