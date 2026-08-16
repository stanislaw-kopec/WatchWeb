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
  signOut: () => Promise<void>
}

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)
