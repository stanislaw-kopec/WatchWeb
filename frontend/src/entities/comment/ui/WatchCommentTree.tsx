import type { ReactNode } from 'react'

import type { WatchComment } from '@/entities/comment/model/types'
import { CommentTree } from '@/entities/comment/ui/CommentTree'

type WatchCommentTreeProps = {
  comments: WatchComment[]
  renderActions?: (comment: WatchComment) => ReactNode
  renderReplyForm?: (comment: WatchComment) => ReactNode
}

export function WatchCommentTree({ comments, renderActions, renderReplyForm }: WatchCommentTreeProps) {
  return (
    <CommentTree
      comments={comments}
      emptyMessage="Nie ma jeszcze komentarzy pod tym zegarkiem."
      renderActions={renderActions}
      renderReplyForm={renderReplyForm}
    />
  )
}
