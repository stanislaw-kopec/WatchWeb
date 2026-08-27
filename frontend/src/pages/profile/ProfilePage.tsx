import {
  CalendarDays,
  FilePenLine,
  ListChecks,
  Mail,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Star,
  Watch,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router'

import { useCurrentUser } from '@/entities/user/api/useCurrentUser'
import { UserAvatar } from '@/entities/user/ui/UserAvatar'
import { USER_ROLE_LABELS } from '@/features/auth/model/roleLabels'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { AccountDeletionPanel } from '@/features/profile-account/ui/AccountDeletionPanel'
import { AvatarUploadForm } from '@/features/profile-account/ui/AvatarUploadForm'
import { PasswordChangeForm } from '@/features/profile-account/ui/PasswordChangeForm'
import { ProfileEditForm } from '@/features/profile-account/ui/ProfileEditForm'
import { formatDateTime } from '@/shared/lib/date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ErrorState } from '@/shared/ui/error-state'
import { MetricCard } from '@/shared/ui/metric-card'
import { Skeleton } from '@/shared/ui/skeleton'

export function ProfilePage() {
  const { isAuthenticated, updateUser, user: sessionUser } = useAuthSession()
  const currentUserQuery = useCurrentUser(isAuthenticated)
  const user = currentUserQuery.data ?? sessionUser

  useEffect(() => {
    if (currentUserQuery.data) {
      updateUser(currentUserQuery.data)
    }
  }, [currentUserQuery.data, updateUser])

  if (currentUserQuery.isLoading && !user) {
    return <ProfileSkeleton />
  }

  if (currentUserQuery.isError && !user) {
    return (
      <ErrorState
        description="Zaloguj się ponownie albo odśwież sesję."
        isRetrying={currentUserQuery.isFetching}
        onRetry={() => void currentUserQuery.refetch()}
        title="Nie udało się pobrać profilu"
      />
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">Profil</Badge>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            <UserAvatar user={user} />
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
                {user?.username}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Zarządzaj danymi profilu, bezpieczeństwem konta i skrótami do swojej aktywności.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={ShieldCheck}
            label="Rola"
            value={user ? USER_ROLE_LABELS[user.role] : '-'}
            valueClassName="break-words text-xl"
          />
          <MetricCard
            icon={CalendarDays}
            label="Konto od"
            value={user ? formatShortDate(user.createdAt) : '-'}
            valueClassName="break-words text-xl"
          />
          <MetricCard
            className="col-span-2"
            icon={Mail}
            label="Email"
            value={user?.email ?? '-'}
            valueClassName="break-words text-xl"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {user ? (
          <div className="space-y-6">
            <ProfileEditForm user={user} />
            <AvatarUploadForm user={user} />
            <PasswordChangeForm />
            <AccountDeletionPanel user={user} />
          </div>
        ) : null}

        <aside className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle>Dane konta</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Aktualny stan profilu i uprawnień.
                </p>
              </div>
              <Button
                disabled={currentUserQuery.isFetching}
                onClick={() => void currentUserQuery.refetch()}
                type="button"
                variant="outline"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Odśwież
              </Button>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-3">
                <ProfileFact label="Id użytkownika" value={user?.id ?? '-'} />
                <ProfileFact label="Nazwa użytkownika" value={user?.username ?? '-'} />
                <ProfileFact label="Email" value={user?.email ?? '-'} />
                <ProfileFact label="Rola" value={user ? USER_ROLE_LABELS[user.role] : '-'} />
                <ProfileFact label="Utworzono" value={user ? formatDateTime(user.createdAt) : '-'} />
                <ProfileFact label="Anonimizacja" value={user?.anonymized ? 'Tak' : 'Nie'} />
              </dl>
            </CardContent>
          </Card>

          {user?.role === 'ROLE_JOURNALIST' || user?.role === 'ROLE_ADMIN' ? (
            <Card>
              <CardHeader>
                <CardTitle>Redakcja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/articles/new">
                    <PlusCircle className="size-4" aria-hidden="true" />
                    Napisz artykuł
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/me/articles">
                    <FilePenLine className="size-4" aria-hidden="true" />
                    Moje artykuły
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Społeczność</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/posts/new">
                  <PlusCircle className="size-4" aria-hidden="true" />
                  Dodaj post
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link to="/me/posts">
                  <ListChecks className="size-4" aria-hidden="true" />
                  Moje posty
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link to="/me/reviews">
                  <Star className="size-4" aria-hidden="true" />
                  Moje recenzje
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Katalog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/watches/submit">
                  <Watch className="size-4" aria-hidden="true" />
                  Zgłoś zegarek
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link to="/me/watch-submissions">
                  <ListChecks className="size-4" aria-hidden="true" />
                  Moje zgłoszenia
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </section>
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

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Skeleton className="h-56" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="col-span-2 h-28" />
        </div>
      </div>
      <Skeleton className="h-72" />
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
