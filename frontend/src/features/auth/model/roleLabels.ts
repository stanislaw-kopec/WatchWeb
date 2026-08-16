import type { UserRole } from '@/entities/user/model/types'

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ROLE_USER: 'Użytkownik',
  ROLE_MODERATOR: 'Moderator',
  ROLE_JOURNALIST: 'Redaktor',
  ROLE_ADMIN: 'Administrator',
}
