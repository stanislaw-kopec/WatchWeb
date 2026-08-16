import type { ReactNode } from 'react'
import { MessageCircle } from 'lucide-react'

import type { CommentTreeNode } from '@/entities/comment/model/types'
import { formatDateTime } from '@/shared/lib/date'
import { cn } from '@/shared/lib/utils'
import { Card, CardContent } from '@/shared/ui/card'

type CommentTreeProps<TComment extends CommentTreeNode> = {
  comments: TComment[]
  emptyMessage: string
  renderActions?: (comment: TComment) => ReactNode
  renderReplyForm?: (comment: TComment) => ReactNode
}

export function CommentTree<TComment extends CommentTreeNode>({
  comments,
  emptyMessage,
  renderActions,
  renderReplyForm,
}: CommentTreeProps<TComment>) {
  if (comments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentNode
          comment={comment}
          key={comment.id}
          renderActions={renderActions}
          renderReplyForm={renderReplyForm}
        />
      ))}
    </div>
  )
}

type CommentNodeProps<TComment extends CommentTreeNode> = {
  comment: TComment
  renderActions?: (comment: TComment) => ReactNode
  renderReplyForm?: (comment: TComment) => ReactNode
}

function CommentNode<TComment extends CommentTreeNode>({
  comment,
  renderActions,
  renderReplyForm,
}: CommentNodeProps<TComment>) {
  const actions = renderActions?.(comment)
  const replyForm = renderReplyForm?.(comment)

  return (
    <article
      className={cn(
        'rounded-lg border border-border bg-card p-4 shadow-sm',
        comment.depth > 1 && 'ml-4 border-l-4 sm:ml-8',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
          <MessageCircle className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium text-foreground">{comment.authorUsername}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(comment.createdAt)}</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {comment.deleted ? 'Komentarz został usunięty.' : comment.content}
          </p>
          {actions ? <div className="mt-3">{actions}</div> : null}
          {replyForm ? <div className="mt-3">{replyForm}</div> : null}
        </div>
      </div>

      {comment.children.length > 0 ? (
        <div className="mt-3 space-y-3">
          {comment.children.map((child) => (
            <CommentNode
              comment={child as TComment}
              key={child.id}
              renderActions={renderActions}
              renderReplyForm={renderReplyForm}
            />
          ))}
        </div>
      ) : null}
    </article>
  )
}
