import type { PostStatus } from '@/entities/post/model/types'
import { POST_STATUS_LABELS } from '@/entities/post/model/postStatus'
import { Badge } from '@/shared/ui/badge'

type PostStatusBadgeProps = {
  status: PostStatus
}

const STATUS_CLASS_NAMES: Record<PostStatus, string> = {
  PENDING: 'border border-accent/50 bg-accent/15 text-accent-foreground',
  APPROVED: 'border border-primary/30 bg-secondary text-secondary-foreground',
  REJECTED: 'border border-destructive/40 bg-destructive/10 text-destructive',
}

export function PostStatusBadge({ status }: PostStatusBadgeProps) {
  return (
    <Badge className={STATUS_CLASS_NAMES[status]} variant="outline">
      {POST_STATUS_LABELS[status]}
    </Badge>
  )
}
