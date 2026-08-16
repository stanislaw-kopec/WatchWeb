export type UserRole = 'ROLE_USER' | 'ROLE_MODERATOR' | 'ROLE_JOURNALIST' | 'ROLE_ADMIN'

export type User = {
  id: string
  username: string
  email: string
  role: UserRole
  avatarUrl: string | null
  anonymized: boolean
  anonymizedAt: string | null
  createdAt: string
}
