import { UserCircle } from 'lucide-react'

import type { User } from '@/entities/user/model/types'
import { cn } from '@/shared/lib/utils'

type UserAvatarProps = {
  user: Pick<User, 'avatarUrl' | 'username'> | null | undefined
  className?: string
  iconClassName?: string
}

export function UserAvatar({ user, className, iconClassName }: UserAvatarProps) {
  if (user?.avatarUrl) {
    return (
      <img
        alt=""
        className={cn('size-20 rounded-lg object-cover', className)}
        src={user.avatarUrl}
      />
    )
  }

  return (
    <div className={cn('flex size-20 items-center justify-center rounded-lg bg-secondary text-primary', className)}>
      <UserCircle className={cn('size-10', iconClassName)} aria-hidden="true" />
    </div>
  )
}
