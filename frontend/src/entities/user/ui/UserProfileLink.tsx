import { UserRound } from 'lucide-react'
import { Link } from 'react-router'

import { cn } from '@/shared/lib/utils'

type UserProfileLinkProps = {
  userId: string
  username: string
  className?: string
  withIcon?: boolean
}

export function UserProfileLink({
  userId,
  username,
  className,
  withIcon = false,
}: UserProfileLinkProps) {
  return (
    <Link
      className={cn('inline-flex min-w-0 items-center gap-1 transition hover:text-primary', className)}
      to={`/users/${userId}`}
    >
      {withIcon ? <UserRound className="size-3.5 shrink-0" aria-hidden="true" /> : null}
      <span className="truncate">{username}</span>
    </Link>
  )
}
