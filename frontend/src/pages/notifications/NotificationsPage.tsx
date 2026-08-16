import { Bell, CheckCircle2, Clock, RefreshCw } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { useNotifications } from '@/entities/notification/api/useNotifications'
import type { Notification } from '@/entities/notification/model/types'
import { NotificationCard } from '@/entities/notification/ui/NotificationCard'
import {
  buildNotificationSearchParams,
  filterNotifications,
  NOTIFICATION_PAGE_SIZES,
  parseNotificationSearchParams,
  toNotificationListParams,
} from '@/features/notification-list/model/notificationListFilters'
import type { NotificationReadFilter } from '@/features/notification-list/model/notificationListFilters'
import { NotificationReadFilterTabs } from '@/features/notification-list/ui/NotificationReadFilterTabs'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { Pagination } from '@/shared/ui/pagination'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

export function NotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchState = useMemo(() => parseNotificationSearchParams(searchParams), [searchParams])
  const listParams = useMemo(() => toNotificationListParams(searchState), [searchState])
  const notificationsQuery = useNotifications(listParams)
  const notifications = notificationsQuery.data?.content ?? []
  const visibleNotifications = filterNotifications(notifications, searchState.read)
  const visibleStats = getVisibleStats(notifications)

  function changeReadFilter(read: NotificationReadFilter) {
    setSearchParams(buildNotificationSearchParams(read, 0, searchState.size))
  }

  function changePage(page: number) {
    setSearchParams(buildNotificationSearchParams(searchState.read, page, searchState.size))
  }

  function changePageSize(size: number) {
    setSearchParams(buildNotificationSearchParams(searchState.read, 0, size))
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">Powiadomienia</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
            Centrum powiadomień
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Tu trafiają decyzje moderatorów dotyczące Twoich postów i zgłoszeń zegarków do katalogu.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <NotificationStat
            icon={Bell}
            label="Wszystkie"
            value={formatNumber(notificationsQuery.data?.totalElements)}
          />
          <NotificationStat icon={Clock} label="Nowe na stronie" value={visibleStats.unread} />
          <NotificationStat icon={CheckCircle2} label="Przeczytane" value={visibleStats.read} />
          <NotificationStat icon={Bell} label="Na stronie" value={String(notifications.length)} />
        </div>
      </section>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Filtry</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {notificationsQuery.data
                ? `${notificationsQuery.data.totalElements} powiadomień, strona ${notificationsQuery.data.number + 1}`
                : 'Ładowanie powiadomień'}
            </p>
          </div>
          <Button
            disabled={notificationsQuery.isFetching}
            onClick={() => void notificationsQuery.refetch()}
            type="button"
            variant="outline"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Odśwież
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Widok</span>
            <NotificationReadFilterTabs
              disabled={notificationsQuery.isFetching}
              onChange={changeReadFilter}
              value={searchState.read}
            />
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Na stronie</span>
            <Select
              disabled={notificationsQuery.isFetching}
              onChange={(event) => changePageSize(Number(event.target.value))}
              value={searchState.size}
            >
              {NOTIFICATION_PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </label>
        </CardContent>
      </Card>

      <section className="space-y-4">
        {notificationsQuery.isLoading ? <NotificationSkeleton /> : null}

        {notificationsQuery.isError ? (
          <ErrorState
            description="Nie mogliśmy odświeżyć Twoich powiadomień."
            isRetrying={notificationsQuery.isFetching}
            onRetry={() => void notificationsQuery.refetch()}
            title="Nie udało się pobrać powiadomień"
          />
        ) : null}

        {notificationsQuery.isSuccess && visibleNotifications.length === 0 ? (
          <EmptyState
            description="Nowe informacje o moderacji i aktywności pojawią się tutaj."
            title="Brak powiadomień w wybranym widoku"
          />
        ) : null}

        {visibleNotifications.length > 0 ? (
          <div className="space-y-4">
            {visibleNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        ) : null}

        <Pagination
          disabled={notificationsQuery.isFetching}
          onPageChange={changePage}
          page={notificationsQuery.data?.number ?? searchState.page}
          totalPages={notificationsQuery.data?.totalPages ?? 0}
        />
      </section>
    </div>
  )
}

type NotificationStatProps = {
  icon: typeof Bell
  label: string
  value: string
}

function NotificationStat({ icon: Icon, label, value }: NotificationStatProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex min-h-20 flex-col justify-between gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="size-4 text-primary" aria-hidden="true" />
        </div>
        <p className="text-2xl font-semibold tracking-normal text-foreground">{value}</p>
      </div>
    </div>
  )
}

function NotificationSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton className="h-44" key={index} />
      ))}
    </div>
  )
}

function getVisibleStats(notifications: Notification[]) {
  const unread = notifications.filter((notification) => !notification.read).length

  return {
    unread: String(unread),
    read: String(notifications.length - unread),
  }
}

function formatNumber(value: number | undefined) {
  return value === undefined ? '-' : String(value)
}
