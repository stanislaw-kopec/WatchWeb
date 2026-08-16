import { AlertCircle, ArrowLeft, FileText, RefreshCw, Star } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'

import { useMyReviews } from '@/entities/review/api/useWatchReviews'
import type { UserReview } from '@/entities/review/model/types'
import { MyReviewCard } from '@/entities/review/ui/MyReviewCard'
import {
  buildMyReviewListSearchParams,
  MY_REVIEW_PAGE_SIZES,
  parseMyReviewListSearchParams,
  toMyReviewListParams,
} from '@/features/my-reviews/model/myReviewListFilters'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Pagination } from '@/shared/ui/pagination'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

export function MyReviewsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchState = useMemo(() => parseMyReviewListSearchParams(searchParams), [searchParams])
  const listParams = useMemo(() => toMyReviewListParams(searchState), [searchState])
  const reviewsQuery = useMyReviews(listParams)
  const reviews = reviewsQuery.data?.content ?? []
  const visibleStats = getVisibleStats(reviews)

  function changePage(page: number) {
    setSearchParams(buildMyReviewListSearchParams(page, searchState.size))
  }

  function changePageSize(size: number) {
    setSearchParams(buildMyReviewListSearchParams(0, size))
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link to="/me">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Wróć do profilu
        </Link>
      </Button>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">Moje recenzje</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
            Ocenione zegarki
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Tu możesz wrócić do swoich opinii, poprawić ocenę albo usunąć recenzję z katalogu.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ReviewStat icon={FileText} label="Wszystkie" value={formatNumber(reviewsQuery.data?.totalElements)} />
          <ReviewStat icon={Star} label="Na stronie" value={String(reviews.length)} />
          <ReviewStat icon={Star} label="Średnia ocen" value={visibleStats.averageRating} wide />
        </div>
      </section>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Lista recenzji</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {reviewsQuery.data
                ? `${reviewsQuery.data.totalElements} recenzji, strona ${reviewsQuery.data.number + 1}`
                : 'Ładowanie recenzji'}
            </p>
          </div>
          <Button
            disabled={reviewsQuery.isFetching}
            onClick={() => void reviewsQuery.refetch()}
            type="button"
            variant="outline"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Odśwież
          </Button>
        </CardHeader>
        <CardContent>
          <label className="grid max-w-56 gap-2">
            <span className="text-sm font-medium text-foreground">Na stronie</span>
            <Select
              disabled={reviewsQuery.isFetching}
              onChange={(event) => changePageSize(Number(event.target.value))}
              value={searchState.size}
            >
              {MY_REVIEW_PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </label>
        </CardContent>
      </Card>

      <section className="space-y-4">
        {reviewsQuery.isLoading ? <MyReviewsSkeleton /> : null}

        {reviewsQuery.isError ? (
          <Card className="border-destructive/40">
            <CardHeader className="flex-row items-start gap-3 space-y-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <AlertCircle className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Nie udało się pobrać Twoich recenzji</CardTitle>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {reviewsQuery.error instanceof Error
                    ? reviewsQuery.error.message
                    : 'Spróbuj odświeżyć listę.'}
                </p>
              </div>
            </CardHeader>
          </Card>
        ) : null}

        {reviewsQuery.isSuccess && reviews.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nie masz jeszcze żadnych recenzji.
            </CardContent>
          </Card>
        ) : null}

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <MyReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : null}

        <Pagination
          disabled={reviewsQuery.isFetching}
          onPageChange={changePage}
          page={reviewsQuery.data?.number ?? searchState.page}
          totalPages={reviewsQuery.data?.totalPages ?? 0}
        />
      </section>
    </div>
  )
}

type ReviewStatProps = {
  icon: typeof FileText
  label: string
  value: string
  wide?: boolean
}

function ReviewStat({ icon: Icon, label, value, wide }: ReviewStatProps) {
  return (
    <div className={wide ? 'col-span-2 rounded-lg border border-border bg-card p-4 shadow-sm' : 'rounded-lg border border-border bg-card p-4 shadow-sm'}>
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

function MyReviewsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton className="h-72" key={index} />
      ))}
    </div>
  )
}

function getVisibleStats(reviews: UserReview[]) {
  if (reviews.length === 0) {
    return {
      averageRating: '-',
    }
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  return {
    averageRating: averageRating.toFixed(1),
  }
}

function formatNumber(value: number | undefined) {
  return value === undefined ? '-' : String(value)
}
