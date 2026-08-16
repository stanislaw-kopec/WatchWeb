import type { WatchSubmissionStatus } from '@/entities/watch/model/submissionTypes'
import { WATCH_SUBMISSION_STATUS_LABELS } from '@/entities/watch/model/watchSubmissionStatus'
import { Badge } from '@/shared/ui/badge'

type WatchSubmissionStatusBadgeProps = {
  status: WatchSubmissionStatus
}

const STATUS_CLASS_NAMES: Record<WatchSubmissionStatus, string> = {
  PENDING: 'border border-accent/50 bg-accent/15 text-accent-foreground',
  APPROVED: 'border border-primary/30 bg-secondary text-secondary-foreground',
  REJECTED: 'border border-destructive/40 bg-destructive/10 text-destructive',
}

export function WatchSubmissionStatusBadge({ status }: WatchSubmissionStatusBadgeProps) {
  return (
    <Badge className={STATUS_CLASS_NAMES[status]} variant="outline">
      {WATCH_SUBMISSION_STATUS_LABELS[status]}
    </Badge>
  )
}
