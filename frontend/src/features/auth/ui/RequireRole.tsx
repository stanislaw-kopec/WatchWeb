import { ShieldAlert } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { Link, Navigate, useLocation } from 'react-router'

import type { UserRole } from '@/entities/user/model/types'
import { USER_ROLE_LABELS } from '@/features/auth/model/roleLabels'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

type RequireRoleProps = PropsWithChildren<{
  allowedRoles: UserRole[]
}>

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuthSession()

  if (!isAuthenticated) {
    return <Navigate replace to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`} />
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <Card className="border-destructive/40">
        <CardHeader className="flex-row items-start gap-3 space-y-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>Brak uprawnień</CardTitle>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Ten widok wymaga roli: {allowedRoles.map((role) => USER_ROLE_LABELS[role]).join(', ')}.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link to="/">Wróć na start</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return children
}
