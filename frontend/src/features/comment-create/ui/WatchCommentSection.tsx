import { MessageSquareReply, X } from 'lucide-react'
import { useState } from 'react'

import type { WatchComment } from '@/entities/comment/model/types'
import { WatchCommentTree } from '@/entities/comment/ui/WatchCommentTree'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { CreateWatchCommentForm } from '@/features/comment-create/ui/CreateWatchCommentForm'
import { Button } from '@/shared/ui/button'

const MAX_COMMENT_DEPTH = 3

type WatchCommentSectionProps = {
  watchId: string
  comments: WatchComment[]
}

export function WatchCommentSection({ watchId, comments }: WatchCommentSectionProps) {
  const [replyCommentId, setReplyCommentId] = useState<string | null>(null)
  const { isAuthenticated } = useAuthSession()

  return (
    <div className="space-y-4">
      <CreateWatchCommentForm watchId={watchId} />
      <WatchCommentTree
        comments={comments}
        renderActions={(comment) => {
          if (!isAuthenticated || comment.deleted || comment.depth >= MAX_COMMENT_DEPTH) {
            return null
          }

          const isReplying = replyCommentId === comment.id

          return (
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
