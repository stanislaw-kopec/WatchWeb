import type { UserRole } from '@/entities/user/model/types'

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ROLE_USER: 'Użytkownik',
  ROLE_MODERATOR: 'Moderator',
  ROLE_JOURNALIST: 'Redaktor',
  ROLE_ADMIN: 'Administrator',
}

export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  ROLE_USER: 'Komentarze, recenzje i własne posty oczekujące na moderację.',
  ROLE_MODERATOR: 'Uprawnienia użytkownika oraz moderacja postów i zgłoszeń zegarków.',
  ROLE_JOURNALIST: 'Uprawnienia użytkownika oraz publikowanie artykułów branżowych.',
  ROLE_ADMIN: 'Pełna administracja użytkownikami, rolami i treściami.',
}

export const USER_ROLE_OPTIONS: UserRole[] = [
  'ROLE_USER',
  'ROLE_MODERATOR',
  'ROLE_JOURNALIST',
  'ROLE_ADMIN',
]
