import { ArrowLeft, Gauge, MessageCircle, Ruler, Star, Watch, Waves } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { useWatch } from '@/entities/watch/api/useWatches'
import { formatMovementType } from '@/entities/watch/model/movementType'
import type { Watch as WatchModel, WatchDetails } from '@/entities/watch/model/types'
import { useWatchComments } from '@/entities/comment/api/useWatchComments'
import type { WatchComment } from '@/entities/comment/model/types'
import { useWatchReviews } from '@/entities/review/api/useWatchReviews'
import { ReviewList } from '@/entities/review/ui/ReviewList'
import { WatchCommentSection } from '@/features/comment-create/ui/WatchCommentSection'
import { CreateReviewForm } from '@/features/review-create/ui/CreateReviewForm'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ErrorState } from '@/shared/ui/error-state'
import { Skeleton } from '@/shared/ui/skeleton'

export function WatchDetailsPage() {
  const { watchId } = useParams()
  const watchQuery = useWatch(watchId)
  const reviewsQuery = useWatchReviews(watchId, { size: 6, sort: 'createdAt,desc' })
  const commentsQuery = useWatchComments(watchId)

  if (watchQuery.isLoading) {
    return <WatchDetailsSkeleton />
  }

  if (watchQuery.isError || !watchQuery.data) {
    return (
      <ErrorState
        description="Sprawdź, czy wybrany model nadal istnieje w katalogu."
        isRetrying={watchQuery.isFetching}
        onRetry={() => void watchQuery.refetch()}
        title="Nie udało się pobrać zegarka"
      />
    )
  }

  const watch = watchQuery.data
  const reviews = reviewsQuery.data?.content ?? []
  const comments = commentsQuery.data ?? []
  const commentsCount = countComments(comments)

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link to="/watches">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Wróć do katalogu
        </Link>
      </Button>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">{formatMovementType(watch.details?.movementType)}</Badge>
          <p className="mt-5 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {watch.brand}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-foreground md:text-5xl">
            {watch.model}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            Referencja {watch.referenceCode}. Dane techniczne, oceny i dyskusja są pobierane
            bezpośrednio z backendu WatchWeb.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DetailStat icon={Star} label="Ocena" value={Number(watch.averageRating).toFixed(1)} />
          <DetailStat icon={MessageCircle} label="Recenzje" value={String(watch.reviewsCount)} />
          <DetailStat icon={Watch} label="Komentarze" value={String(commentsCount)} />
          <DetailStat icon={Waves} label="WR" value={formatWaterResistance(watch.details)} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <TechnicalDetails watch={watch} />

          <section className="space-y-3">
            <SectionHeader
              title="Recenzje"
              description={
                reviewsQuery.data
                  ? `${reviewsQuery.data.totalElements} recenzji dla tego modelu`
                  : 'Ładowanie recenzji'
              }
            />
            <CreateReviewForm watchId={watch.id} />
            {reviewsQuery.isLoading ? <Skeleton className="h-48" /> : null}
            {reviewsQuery.isError ? (
              <ErrorState
                isRetrying={reviewsQuery.isFetching}
                onRetry={() => void reviewsQuery.refetch()}
                size="compact"
                title="Nie udało się pobrać recenzji"
              />
            ) : null}
            {reviewsQuery.isSuccess ? <ReviewList reviews={reviews} /> : null}
          </section>
        </div>

        <section className="space-y-3">
          <SectionHeader
            title="Komentarze"
            description={`${commentsCount} wypowiedzi w drzewie dyskusji`}
          />
          {commentsQuery.isLoading ? <Skeleton className="h-64" /> : null}
          {commentsQuery.isError ? (
            <ErrorState
              isRetrying={commentsQuery.isFetching}
              onRetry={() => void commentsQuery.refetch()}
              size="compact"
              title="Nie udało się pobrać komentarzy"
            />
          ) : null}
          {commentsQuery.isSuccess ? <WatchCommentSection comments={comments} watchId={watch.id} /> : null}
        </section>
      </section>
    </div>
  )
}

type DetailStatProps = {
  icon: typeof Star
  label: string
  value: string
}

function DetailStat({ icon: Icon, label, value }: DetailStatProps) {
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

function TechnicalDetails({ watch }: { watch: WatchModel }) {
  const details = watch.details

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dane techniczne</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <TechnicalFact icon={Gauge} label="Mechanizm" value={formatMovementType(details?.movementType)} />
          <TechnicalFact label="Kaliber" value={details?.caliber ?? 'Brak danych'} />
          <TechnicalFact icon={Ruler} label="Średnica koperty" value={formatMillimeters(details?.caseDiameterMm)} />
          <TechnicalFact label="Grubość koperty" value={formatMillimeters(details?.caseThicknessMm)} />
          <TechnicalFact label="Lug to lug" value={formatMillimeters(details?.lugToLugMm)} />
          <TechnicalFact label="Szerokość paska" value={formatMillimeters(details?.strapWidthMm)} />
          <TechnicalFact icon={Waves} label="Wodoszczelność" value={formatWaterResistance(details)} />
          <TechnicalFact label="Szkło" value={details?.crystalType ?? 'Brak danych'} />
          <TechnicalFact label="Materiał koperty" value={details?.caseMaterial ?? 'Brak danych'} />
        </div>
      </CardContent>
    </Card>
  )
}

type TechnicalFactProps = {
  label: string
  value: string
  icon?: typeof Gauge
}

function TechnicalFact({ label, value, icon: Icon }: TechnicalFactProps) {
  return (
    <div className="rounded-md border border-border bg-secondary/45 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
        <p>{label}</p>
      </div>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  )
}

type SectionHeaderProps = {
  title: string
  description: string
}

function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-normal text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function WatchDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-36" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Skeleton className="h-64" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-28" key={index} />
          ))}
        </div>
      </div>
      <Skeleton className="h-80" />
    </div>
  )
}

function countComments(comments: Array<{ children: WatchComment[] }>): number {
  return comments.reduce((total, comment) => total + 1 + countComments(comment.children), 0)
}

function formatMillimeters(value: number | null | undefined) {
  return value ? `${value} mm` : 'Brak danych'
}

function formatWaterResistance(details: WatchDetails | null | undefined) {
  return details?.waterResistanceM ? `${details.waterResistanceM} m` : 'Brak danych'
}
