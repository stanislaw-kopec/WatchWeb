import type { UserRole } from '@/entities/user/model/types'
import { USER_ROLE_LABELS } from '@/entities/user/model/roleLabels'
import { Badge } from '@/shared/ui/badge'

type UserRoleBadgeProps = {
  role: UserRole
}

const ROLE_CLASS_NAMES: Record<UserRole, string> = {
  ROLE_USER: 'border border-border bg-card text-muted-foreground',
  ROLE_MODERATOR: 'border border-primary/30 bg-secondary text-secondary-foreground',
  ROLE_JOURNALIST: 'border border-accent/50 bg-accent/15 text-accent-foreground',
  ROLE_ADMIN: 'border border-destructive/40 bg-destructive/10 text-destructive',
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return (
    <Badge className={ROLE_CLASS_NAMES[role]} variant="outline">
      {USER_ROLE_LABELS[role]}
    </Badge>
  )
}
