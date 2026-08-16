import { ArrowRight, CalendarDays, Star, Watch } from 'lucide-react'
import { Link } from 'react-router'

import type { UserReview } from '@/entities/review/model/types'
import { ReviewActions } from '@/features/review-manage/ui/ReviewActions'
import { formatDateTime } from '@/shared/lib/date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

type MyReviewCardProps = {
  review: UserReview
}

export function MyReviewCard({ review }: MyReviewCardProps) {
  return (
    <Card>
      <CardContent className="flex min-w-0 flex-col gap-5 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Recenzja</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {formatDateTime(review.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3.5 fill-accent text-accent" aria-hidden="true" />
            {review.rating}/10
          </span>
        </div>

        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            <Watch className="size-4" aria-hidden="true" />
            {review.watchBrand}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal text-foreground">
            {review.watchModel}
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{review.content}</p>
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild variant="outline">
            <Link to={`/watches/${review.watchId}`}>
              Zobacz zegarek
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="border-t border-border pt-4">
          <ReviewActions review={review} />
        </div>
      </CardContent>
    </Card>
  )
}
