import { ARTICLE_STATUS_LABELS } from '@/entities/article/model/articleStatus'
import type { ArticleStatus } from '@/entities/article/model/types'
import { Badge } from '@/shared/ui/badge'

export function ArticleStatusBadge({ status }: { status: ArticleStatus }) {
  return <Badge variant={status === 'PUBLISHED' ? 'default' : 'outline'}>{ARTICLE_STATUS_LABELS[status]}</Badge>
}
