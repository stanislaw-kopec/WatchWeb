import {
  AlertCircle,
  CalendarDays,
  ListChecks,
  Mail,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  UserCircle,
  Watch,
} from 'lucide-react'
import { Link } from 'react-router'

import { useCurrentUser } from '@/entities/user/api/useCurrentUser'
import type { User } from '@/entities/user/model/types'
import { USER_ROLE_LABELS } from '@/features/auth/model/roleLabels'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { formatDateTime } from '@/shared/lib/date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

export function ProfilePage() {
  const { isAuthenticated, user: sessionUser } = useAuthSession()
  const currentUserQuery = useCurrentUser(isAuthenticated)
  const user = currentUserQuery.data ?? sessionUser

  if (currentUserQuery.isLoading && !user) {
    return <ProfileSkeleton />
  }

  if (currentUserQuery.isError && !user) {
    return (
      <Card className="border-destructive/40">
        <CardHeader className="flex-row items-start gap-3 space-y-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <AlertCircle className="size-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>Nie udało się pobrać profilu</CardTitle>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Zaloguj się ponownie albo odśwież sesję.
            </p>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">Profil</Badge>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            <AvatarPreview user={user} />
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
                {user?.username}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Dane pobierane z chronionego endpointu `/api/users/me`.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ProfileStat icon={ShieldCheck} label="Rola" value={user ? USER_ROLE_LABELS[user.role] : '-'} />
          <ProfileStat icon={CalendarDays} label="Konto od" value={user ? formatShortDate(user.createdAt) : '-'} />
          <ProfileStat icon={Mail} label="Email" value={user?.email ?? '-'} wide />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle>Dane konta</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Pierwszy widok używający tokena JWT po stronie frontendu.
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
            <dl className="grid gap-3 sm:grid-cols-2">
              <ProfileFact label="Id użytkownika" value={user?.id ?? '-'} />
              <ProfileFact label="Nazwa użytkownika" value={user?.username ?? '-'} />
              <ProfileFact label="Email" value={user?.email ?? '-'} />
              <ProfileFact label="Rola" value={user ? USER_ROLE_LABELS[user.role] : '-'} />
              <ProfileFact label="Utworzono" value={user ? formatDateTime(user.createdAt) : '-'} />
              <ProfileFact label="Anonimizacja" value={user?.anonymized ? 'Tak' : 'Nie'} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sesja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Access token jest wysyłany automatycznie w nagłówku `Authorization`.</p>
            <p>Jeśli backend zwróci `401`, frontend spróbuje odświeżyć token przez refresh token i ponowi request.</p>
          </CardContent>
        </Card>

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
      </section>
    </div>
  )
}

type AvatarPreviewProps = {
  user: User | null | undefined
}

function AvatarPreview({ user }: AvatarPreviewProps) {
  if (user?.avatarUrl) {
    return <img alt="" className="size-20 rounded-lg object-cover" src={user.avatarUrl} />
  }

  return (
    <div className="flex size-20 items-center justify-center rounded-lg bg-secondary text-primary">
      <UserCircle className="size-10" aria-hidden="true" />
    </div>
  )
}

type ProfileStatProps = {
  icon: typeof ShieldCheck
  label: string
  value: string
  wide?: boolean
}

function ProfileStat({ icon: Icon, label, value, wide }: ProfileStatProps) {
  return (
    <div className={wide ? 'col-span-2 rounded-lg border border-border bg-card p-4 shadow-sm' : 'rounded-lg border border-border bg-card p-4 shadow-sm'}>
      <div className="flex min-h-20 flex-col justify-between gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="size-4 text-primary" aria-hidden="true" />
        </div>
        <p className="break-words text-xl font-semibold tracking-normal text-foreground">{value}</p>
      </div>
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
