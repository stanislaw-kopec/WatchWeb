import { Star } from 'lucide-react'

import type { Review } from '@/entities/review/model/types'
import { UserProfileLink } from '@/entities/user/ui/UserProfileLink'
import { formatDateTime } from '@/shared/lib/date'
import { Card, CardContent } from '@/shared/ui/card'

type ReviewListProps = {
  reviews: Review[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">
          Ten zegarek nie ma jeszcze widocznych recenzji.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <article className="rounded-lg border border-border bg-card p-4 shadow-sm" key={review.id}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <UserProfileLink
                className="font-medium text-foreground"
                userId={review.reviewerId}
                username={review.reviewerUsername}
              />
              <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(review.createdAt)}</p>
            </div>
            <div className="flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-sm font-medium text-secondary-foreground">
              <Star className="size-4 fill-accent text-accent" aria-hidden="true" />
              {review.rating}/10
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{review.content}</p>
        </article>
      ))}
    </div>
  )
}
