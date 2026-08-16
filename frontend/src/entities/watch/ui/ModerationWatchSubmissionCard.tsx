import type { ReactNode } from 'react'
import { CalendarDays } from 'lucide-react'

import type { ModerationWatchSubmission } from '@/entities/watch/model/submissionTypes'
import { WatchSubmissionStatusBadge } from '@/entities/watch/ui/WatchSubmissionStatusBadge'
import { WatchTechnicalDetailsGrid } from '@/entities/watch/ui/WatchTechnicalDetailsGrid'
import { UserProfileLink } from '@/entities/user/ui/UserProfileLink'
import { formatDateTime } from '@/shared/lib/date'
import { Card, CardContent } from '@/shared/ui/card'

type ModerationWatchSubmissionCardProps = {
  submission: ModerationWatchSubmission
  actions?: ReactNode
}

export function ModerationWatchSubmissionCard({
  submission,
  actions,
}: ModerationWatchSubmissionCardProps) {
  return (
    <Card>
      <CardContent className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <WatchSubmissionStatusBadge status={submission.status} />
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {formatDateTime(submission.createdAt)}
            </span>
            <UserProfileLink
              className="text-xs text-muted-foreground"
              userId={submission.submittedById}
              username={submission.submittedByUsername}
              withIcon
            />
          </div>

          <div className="mt-4 min-w-0">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {submission.brand}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-foreground">
              {submission.model}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Referencja: {submission.referenceCode || 'Brak danych'}
            </p>
          </div>

          {submission.status === 'REJECTED' && submission.rejectionReason ? (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {submission.rejectionReason}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <WatchTechnicalDetailsGrid details={submission.details} />
          {actions ? <div className="border-t border-border pt-4">{actions}</div> : null}
        </div>
      </CardContent>
    </Card>
  )
}
