import { MessageSquareReply, X } from 'lucide-react'
import { useState } from 'react'

import type { WatchComment } from '@/entities/comment/model/types'
import { WatchCommentTree } from '@/entities/comment/ui/WatchCommentTree'
import type { User } from '@/entities/user/model/types'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { CommentDeleteAction } from '@/features/comment-create/ui/CommentDeleteAction'
import { CreateWatchCommentForm } from '@/features/comment-create/ui/CreateWatchCommentForm'
import { Button } from '@/shared/ui/button'

const MAX_COMMENT_DEPTH = 3

type WatchCommentSectionProps = {
  watchId: string
  comments: WatchComment[]
}

export function WatchCommentSection({ watchId, comments }: WatchCommentSectionProps) {
  const [replyCommentId, setReplyCommentId] = useState<string | null>(null)
  const { isAuthenticated, user } = useAuthSession()

  return (
    <div className="space-y-4">
      <CreateWatchCommentForm watchId={watchId} />
      <WatchCommentTree
        comments={comments}
        renderActions={(comment) => {
          if (!isAuthenticated || comment.deleted) {
            return null
          }

          const canReply = comment.depth < MAX_COMMENT_DEPTH
          const canDelete = user ? canDeleteComment(comment, user) : false
          const isReplying = replyCommentId === comment.id

          return (
            <div className="flex flex-wrap items-center gap-2">
              {canReply ? (
                <Button
                  onClick={() => setReplyCommentId(isReplying ? null : comment.id)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  {isReplying ? (
                    <X className="size-4" aria-hidden="true" />
                  ) : (
                    <MessageSquareReply className="size-4" aria-hidden="true" />
                  )}
                  {isReplying ? 'Zamknij' : 'Odpowiedz'}
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Limit odpowiedzi</span>
              )}
              {canDelete ? (
                <CommentDeleteAction
                  commentId={comment.id}
                  target={{ type: 'watch', resourceId: watchId }}
                />
              ) : null}
            </div>
          )
        }}
        renderReplyForm={(comment) =>
          replyCommentId === comment.id ? (
            <CreateWatchCommentForm
              onCancel={() => setReplyCommentId(null)}
              onSuccess={() => setReplyCommentId(null)}
              parentAuthorUsername={comment.authorUsername}
              parentId={comment.id}
              submitLabel="Dodaj odpowiedź"
              variant="inline"
              watchId={watchId}
            />
          ) : null
        }
      />
    </div>
  )
}

function canDeleteComment(comment: WatchComment, user: User) {
  return comment.authorId === user.id || user.role === 'ROLE_MODERATOR' || user.role === 'ROLE_ADMIN'
}
