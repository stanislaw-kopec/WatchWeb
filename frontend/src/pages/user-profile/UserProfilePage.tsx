import { ArrowLeft, CalendarDays, ShieldCheck, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { useUser } from '@/entities/user/api/useCurrentUser'
import { UserAvatar } from '@/entities/user/ui/UserAvatar'
import { UserRoleBadge } from '@/entities/user/ui/UserRoleBadge'
import { formatDateTime } from '@/shared/lib/date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ErrorState } from '@/shared/ui/error-state'
import { MetricCard } from '@/shared/ui/metric-card'
import { Skeleton } from '@/shared/ui/skeleton'

export function UserProfilePage() {
  const { userId } = useParams()
  const userQuery = useUser(userId)

  if (userQuery.isLoading) {
    return <UserProfileSkeleton />
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <ErrorState
        description="Sprawdź, czy wybrany użytkownik nadal istnieje."
        isRetrying={userQuery.isFetching}
        onRetry={() => void userQuery.refetch()}
        title="Nie udało się pobrać profilu"
      />
    )
  }

  const user = userQuery.data

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link to="/posts">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Wróć do społeczności
        </Link>
      </Button>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">Profil użytkownika</Badge>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            <UserAvatar className="size-24" iconClassName="size-12" user={user} />
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
                {user.username}
              </h1>
              <div className="mt-3">
                <UserRoleBadge role={user.role} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={ShieldCheck}
            label="Rola"
            value={<UserRoleBadge role={user.role} />}
            valueClassName="text-xl"
          />
          <MetricCard
            icon={CalendarDays}
            label="Konto od"
            value={formatShortDate(user.createdAt)}
            valueClassName="text-xl"
          />
          <MetricCard
            className="col-span-2"
            icon={UserRound}
            label="Status"
            value={user.anonymized ? 'Zanonimizowane' : 'Aktywne'}
            valueClassName="text-xl"
          />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Informacje</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            <ProfileFact label="Id użytkownika" value={user.id} />
            <ProfileFact label="Nazwa użytkownika" value={user.username} />
            <ProfileFact label="Utworzono" value={formatDateTime(user.createdAt)} />
            <ProfileFact
              label="Anonimizacja"
              value={user.anonymizedAt ? formatDateTime(user.anonymizedAt) : 'Nie'}
            />
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

type ProfileFactProps = {
  label: string
  value: string
}

function ProfileFact({ label, value }: ProfileFactProps) {
  return (
    <div className="rounded-md border border-border bg-secondary/45 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

function UserProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-44" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Skeleton className="h-56" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="col-span-2 h-28" />
        </div>
      </div>
      <Skeleton className="h-52" />
    </div>
  )
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}
