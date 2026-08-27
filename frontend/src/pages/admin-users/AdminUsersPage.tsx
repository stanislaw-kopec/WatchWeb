import {
  CalendarDays,
  RefreshCw,
  ShieldCheck,
  UserCog,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { useAdminUsers } from '@/entities/user/api/useAdminUsers'
import type { User, UserRole } from '@/entities/user/model/types'
import { UserRoleBadge } from '@/entities/user/ui/UserRoleBadge'
import {
  ADMIN_USER_PAGE_SIZES,
  buildAdminUserListSearchParams,
  parseAdminUserListSearchParams,
  toAdminUserListParams,
} from '@/features/admin-users/model/adminUserListFilters'
import { UserRoleForm } from '@/features/admin-users/ui/UserRoleForm'
import { USER_ROLE_LABELS } from '@/entities/user/model/roleLabels'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { formatDateTime } from '@/shared/lib/date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { MetricCard } from '@/shared/ui/metric-card'
import { Pagination } from '@/shared/ui/pagination'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

export function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchState = useMemo(() => parseAdminUserListSearchParams(searchParams), [searchParams])
  const listParams = useMemo(() => toAdminUserListParams(searchState), [searchState])
  const usersQuery = useAdminUsers(listParams)
  const { user: currentUser } = useAuthSession()
  const users = usersQuery.data?.content ?? []
  const visibleStats = getVisibleRoleStats(users)

  function changePage(page: number) {
    setSearchParams(buildAdminUserListSearchParams(page, searchState.size))
  }

  function changePageSize(size: number) {
    setSearchParams(buildAdminUserListSearchParams(0, size))
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">Admin</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
            Użytkownicy i role
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Administrator może nadać rolę moderatora osobie, która będzie akceptować lub odrzucać
            posty społecznościowe i zgłoszenia zegarków.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={UsersRound}
            label="Użytkownicy"
            value={formatNumber(usersQuery.data?.totalElements)}
          />
          <MetricCard icon={UserRound} label="Na stronie" value={String(users.length)} />
          <MetricCard icon={ShieldCheck} label="Moderatorzy" value={visibleStats.moderators} />
          <MetricCard icon={UserCog} label="Admini" value={visibleStats.admins} />
        </div>
      </section>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Lista kont</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {usersQuery.data
                ? `${usersQuery.data.totalElements} kont, strona ${usersQuery.data.number + 1}`
                : 'Ładowanie użytkowników'}
            </p>
          </div>
          <Button
            disabled={usersQuery.isFetching}
            onClick={() => void usersQuery.refetch()}
            type="button"
            variant="outline"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Odśwież
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[220px_1fr]">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Na stronie</span>
            <Select
              disabled={usersQuery.isFetching}
              onChange={(event) => changePageSize(Number(event.target.value))}
              value={searchState.size}
            >
              {ADMIN_USER_PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </label>
          <div className="rounded-md border border-border bg-secondary/45 p-3 text-sm leading-6 text-muted-foreground">
            Zmiana roli działa od razu na backendzie. Użytkownik może zobaczyć nową rolę w nagłówku
            po ponownym zalogowaniu albo odświeżeniu sesji.
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        {usersQuery.isLoading ? <AdminUsersSkeleton /> : null}

        {usersQuery.isError ? (
          <ErrorState
            description="Sprawdź aktywną sesję administratora i spróbuj ponownie."
            isRetrying={usersQuery.isFetching}
            onRetry={() => void usersQuery.refetch()}
            title="Nie udało się pobrać użytkowników"
          />
        ) : null}

        {usersQuery.isSuccess && users.length === 0 ? (
          <EmptyState
            description="Przejdź na wcześniejszą stronę, aby wrócić do listy kont."
            title="Brak użytkowników na tej stronie"
          />
        ) : null}

        {users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => (
              <AdminUserCard currentUserId={currentUser?.id} key={user.id} user={user} />
            ))}
          </div>
        ) : null}

        <Pagination
          disabled={usersQuery.isFetching}
          onPageChange={changePage}
          page={usersQuery.data?.number ?? searchState.page}
          totalPages={usersQuery.data?.totalPages ?? 0}
        />
      </section>
    </div>
  )
}

type AdminUserCardProps = {
  user: User
  currentUserId: string | undefined
}

function AdminUserCard({ user, currentUserId }: AdminUserCardProps) {
  return (
    <Card>
      <CardContent className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <UserRoleBadge role={user.role} />
            {user.id === currentUserId ? <Badge variant="secondary">Twoje konto</Badge> : null}
            {user.anonymized ? <Badge variant="outline">Anonimizowane</Badge> : null}
          </div>

          <div className="mt-4 min-w-0">
            <h2 className="truncate text-xl font-semibold tracking-normal text-foreground">
              {user.username}
            </h2>
            <p className="mt-1 break-words text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <UserFact icon={CalendarDays} label="Utworzono" value={formatDateTime(user.createdAt)} />
            <UserFact icon={ShieldCheck} label="Aktualna rola" value={USER_ROLE_LABELS[user.role]} />
          </div>
        </div>

        <UserRoleForm currentUserId={currentUserId} key={user.role} user={user} />
      </CardContent>
    </Card>
  )
}

type UserFactProps = {
  icon: typeof CalendarDays
  label: string
  value: string
}

function UserFact({ icon: Icon, label, value }: UserFactProps) {
  return (
    <div className="rounded-md border border-border bg-secondary/45 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        <p>{label}</p>
      </div>
      <p className="mt-1 break-words font-medium text-foreground">{value}</p>
    </div>
  )
}

function AdminUsersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton className="h-56" key={index} />
      ))}
    </div>
  )
}

function getVisibleRoleStats(users: User[]) {
  return {
    moderators: String(countByRole(users, 'ROLE_MODERATOR')),
    admins: String(countByRole(users, 'ROLE_ADMIN')),
  }
}

function countByRole(users: User[], role: UserRole) {
  return users.filter((user) => user.role === role).length
}

function formatNumber(value: number | undefined) {
  return value === undefined ? '-' : String(value)
}
