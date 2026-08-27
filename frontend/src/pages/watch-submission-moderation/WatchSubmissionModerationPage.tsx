import {
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { useWatchSubmissionModerationQueue } from '@/entities/watch/api/useWatchSubmissionModeration'
import type {
  ModerationWatchSubmission,
  WatchSubmissionStatus,
} from '@/entities/watch/model/submissionTypes'
import { ModerationWatchSubmissionCard } from '@/entities/watch/ui/ModerationWatchSubmissionCard'
import { ModerationQueueTabs } from '@/features/moderation/ui/ModerationQueueTabs'
import {
  buildWatchSubmissionModerationSearchParams,
  parseWatchSubmissionModerationSearchParams,
  toWatchSubmissionModerationListParams,
  WATCH_SUBMISSION_MODERATION_PAGE_SIZES,
} from '@/features/watch-submission-moderation/model/watchSubmissionModerationFilters'
import type { WatchSubmissionModerationStatusFilter as WatchSubmissionModerationStatusFilterValue } from '@/features/watch-submission-moderation/model/watchSubmissionModerationFilters'
import { WatchSubmissionModerationActions } from '@/features/watch-submission-moderation/ui/WatchSubmissionModerationActions'
import { WatchSubmissionModerationStatusFilter } from '@/features/watch-submission-moderation/ui/WatchSubmissionModerationStatusFilter'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { MetricCard } from '@/shared/ui/metric-card'
import { Pagination } from '@/shared/ui/pagination'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

export function WatchSubmissionModerationPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchState = useMemo(() => parseWatchSubmissionModerationSearchParams(searchParams), [searchParams])
  const listParams = useMemo(() => toWatchSubmissionModerationListParams(searchState), [searchState])
  const moderationQuery = useWatchSubmissionModerationQueue(listParams)
  const submissions = moderationQuery.data?.content ?? []
  const visibleStats = getVisibleStatusStats(submissions)

  function changeStatus(status: WatchSubmissionModerationStatusFilterValue) {
    setSearchParams(buildWatchSubmissionModerationSearchParams(status, 0, searchState.size))
  }

  function changePage(page: number) {
    setSearchParams(buildWatchSubmissionModerationSearchParams(searchState.status, page, searchState.size))
  }

  function changePageSize(size: number) {
    setSearchParams(buildWatchSubmissionModerationSearchParams(searchState.status, 0, size))
  }

  return (
    <div className="space-y-6">
      <ModerationQueueTabs />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">Moderacja</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
            Zgłoszenia zegarków
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Zatwierdzenie zgłoszenia tworzy nowy wpis w katalogu. Odrzucenie wymaga powodu,
            który autor zobaczy przy swoim zgłoszeniu.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={FileText}
            label="Wyniki"
            value={formatNumber(moderationQuery.data?.totalElements)}
          />
          <MetricCard icon={Clock} label="Oczekujące" value={visibleStats.pending} />
          <MetricCard icon={CheckCircle2} label="Zatwierdzone" value={visibleStats.approved} />
          <MetricCard icon={XCircle} label="Odrzucone" value={visibleStats.rejected} />
        </div>
      </section>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Filtry zgłoszeń</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {moderationQuery.data
                ? `${moderationQuery.data.totalElements} zgłoszeń, strona ${moderationQuery.data.number + 1}`
                : 'Ładowanie zgłoszeń'}
            </p>
          </div>
          <Button
            disabled={moderationQuery.isFetching}
            onClick={() => void moderationQuery.refetch()}
            type="button"
            variant="outline"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Odśwież
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Status</span>
            <WatchSubmissionModerationStatusFilter
              disabled={moderationQuery.isFetching}
              onChange={changeStatus}
              value={searchState.status}
            />
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Na stronie</span>
            <Select
              disabled={moderationQuery.isFetching}
              onChange={(event) => changePageSize(Number(event.target.value))}
              value={searchState.size}
            >
              {WATCH_SUBMISSION_MODERATION_PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </label>
        </CardContent>
      </Card>

      <section className="space-y-4">
        {moderationQuery.isLoading ? <ModerationSkeleton /> : null}

        {moderationQuery.isError ? (
          <ErrorState
            description="Sprawdź aktywną sesję moderatora lub administratora i spróbuj ponownie."
            isRetrying={moderationQuery.isFetching}
            onRetry={() => void moderationQuery.refetch()}
            title="Nie udało się pobrać zgłoszeń zegarków"
          />
        ) : null}

        {moderationQuery.isSuccess && submissions.length === 0 ? (
          <EmptyState
            description="Wybierz inny status, aby sprawdzić pozostałe zgłoszenia."
            title="Brak zgłoszeń dla wybranego statusu"
          />
        ) : null}

        {submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <ModerationWatchSubmissionCard
                actions={<WatchSubmissionModerationActions submission={submission} />}
                key={submission.id}
                submission={submission}
              />
            ))}
          </div>
        ) : null}

        <Pagination
          disabled={moderationQuery.isFetching}
          onPageChange={changePage}
          page={moderationQuery.data?.number ?? searchState.page}
          totalPages={moderationQuery.data?.totalPages ?? 0}
        />
      </section>
    </div>
  )
}

function ModerationSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton className="h-72" key={index} />
      ))}
    </div>
  )
}

function getVisibleStatusStats(submissions: ModerationWatchSubmission[]) {
  return {
    pending: String(countByStatus(submissions, 'PENDING')),
    approved: String(countByStatus(submissions, 'APPROVED')),
    rejected: String(countByStatus(submissions, 'REJECTED')),
  }
}

function countByStatus(
  submissions: ModerationWatchSubmission[],
  status: WatchSubmissionStatus,
) {
  return submissions.filter((submission) => submission.status === status).length
}

function formatNumber(value: number | undefined) {
  return value === undefined ? '-' : String(value)
}
