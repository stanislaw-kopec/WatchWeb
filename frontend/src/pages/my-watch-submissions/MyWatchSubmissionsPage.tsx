import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  PlusCircle,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'

import { useMyWatchSubmissions } from '@/entities/watch/api/useWatchSubmissions'
import type {
  UserWatchSubmission,
  WatchSubmissionStatus,
} from '@/entities/watch/model/submissionTypes'
import { MyWatchSubmissionCard } from '@/entities/watch/ui/MyWatchSubmissionCard'
import {
  buildMyWatchSubmissionSearchParams,
  MY_WATCH_SUBMISSION_PAGE_SIZES,
  parseMyWatchSubmissionSearchParams,
  toMyWatchSubmissionListParams,
} from '@/features/my-watch-submissions/model/myWatchSubmissionFilters'
import type { MyWatchSubmissionStatusFilter as MyWatchSubmissionStatusFilterValue } from '@/features/my-watch-submissions/model/myWatchSubmissionFilters'
import { MyWatchSubmissionStatusFilter } from '@/features/my-watch-submissions/ui/MyWatchSubmissionStatusFilter'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { Pagination } from '@/shared/ui/pagination'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

export function MyWatchSubmissionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchState = useMemo(() => parseMyWatchSubmissionSearchParams(searchParams), [searchParams])
  const listParams = useMemo(() => toMyWatchSubmissionListParams(searchState), [searchState])
  const submissionsQuery = useMyWatchSubmissions(listParams)
  const submissions = submissionsQuery.data?.content ?? []
  const visibleStats = getVisibleStatusStats(submissions)

  function changeStatus(status: MyWatchSubmissionStatusFilterValue) {
    setSearchParams(buildMyWatchSubmissionSearchParams(status, 0, searchState.size))
  }

  function changePage(page: number) {
    setSearchParams(buildMyWatchSubmissionSearchParams(searchState.status, page, searchState.size))
  }

  function changePageSize(size: number) {
    setSearchParams(buildMyWatchSubmissionSearchParams(searchState.status, 0, size))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/watches">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Wróć do katalogu
          </Link>
        </Button>
        <Button asChild>
          <Link to="/watches/submit">
            <PlusCircle className="size-4" aria-hidden="true" />
            Zgłoś zegarek
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">Moje zgłoszenia</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
            Statusy zegarków
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Tu widzisz zgłoszenia wysłane do katalogu, decyzje moderatora i ewentualny powód odrzucenia.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SubmissionStat
            icon={FileText}
            label="Wyniki"
            value={formatNumber(submissionsQuery.data?.totalElements)}
          />
          <SubmissionStat icon={Clock} label="Oczekujące" value={visibleStats.pending} />
          <SubmissionStat icon={CheckCircle2} label="Zaakceptowane" value={visibleStats.approved} />
          <SubmissionStat icon={XCircle} label="Odrzucone" value={visibleStats.rejected} />
        </div>
      </section>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Filtry zgłoszeń</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {submissionsQuery.data
                ? `${submissionsQuery.data.totalElements} zgłoszeń, strona ${submissionsQuery.data.number + 1}`
                : 'Ładowanie zgłoszeń'}
            </p>
          </div>
          <Button
            disabled={submissionsQuery.isFetching}
            onClick={() => void submissionsQuery.refetch()}
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
            <MyWatchSubmissionStatusFilter
              disabled={submissionsQuery.isFetching}
              onChange={changeStatus}
              value={searchState.status}
            />
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Na stronie</span>
            <Select
              disabled={submissionsQuery.isFetching}
              onChange={(event) => changePageSize(Number(event.target.value))}
              value={searchState.size}
            >
              {MY_WATCH_SUBMISSION_PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </label>
        </CardContent>
      </Card>

      <section className="space-y-4">
        {submissionsQuery.isLoading ? <MyWatchSubmissionSkeleton /> : null}

        {submissionsQuery.isError ? (
          <ErrorState
            description="Nie mogliśmy odświeżyć listy Twoich zgłoszeń."
            isRetrying={submissionsQuery.isFetching}
            onRetry={() => void submissionsQuery.refetch()}
            title="Nie udało się pobrać Twoich zgłoszeń"
          />
        ) : null}

        {submissionsQuery.isSuccess && submissions.length === 0 ? (
          <EmptyState
            description="Wybierz inny status albo zgłoś nowy zegarek do katalogu."
            title="Brak zgłoszeń dla wybranego statusu"
          />
        ) : null}

        {submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <MyWatchSubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        ) : null}

        <Pagination
          disabled={submissionsQuery.isFetching}
          onPageChange={changePage}
          page={submissionsQuery.data?.number ?? searchState.page}
          totalPages={submissionsQuery.data?.totalPages ?? 0}
        />
      </section>
    </div>
  )
}

type SubmissionStatProps = {
  icon: typeof FileText
  label: string
  value: string
}

function SubmissionStat({ icon: Icon, label, value }: SubmissionStatProps) {
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

function MyWatchSubmissionSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton className="h-72" key={index} />
      ))}
    </div>
  )
}

function getVisibleStatusStats(submissions: UserWatchSubmission[]) {
  return {
    pending: String(countByStatus(submissions, 'PENDING')),
    approved: String(countByStatus(submissions, 'APPROVED')),
    rejected: String(countByStatus(submissions, 'REJECTED')),
  }
}

function countByStatus(submissions: UserWatchSubmission[], status: WatchSubmissionStatus) {
  return submissions.filter((submission) => submission.status === status).length
}

function formatNumber(value: number | undefined) {
  return value === undefined ? '-' : String(value)
}
