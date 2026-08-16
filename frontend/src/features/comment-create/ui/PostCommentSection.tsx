import { MessageSquareReply, X } from 'lucide-react'
import { useState } from 'react'

import type { PostComment } from '@/entities/comment/model/types'
import { CommentTree } from '@/entities/comment/ui/CommentTree'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { CreatePostCommentForm } from '@/features/comment-create/ui/CreatePostCommentForm'
import { Button } from '@/shared/ui/button'

const MAX_COMMENT_DEPTH = 3

type PostCommentSectionProps = {
  postId: string
  comments: PostComment[]
}

export function PostCommentSection({ postId, comments }: PostCommentSectionProps) {
  const [replyCommentId, setReplyCommentId] = useState<string | null>(null)
  const { isAuthenticated } = useAuthSession()

  return (
    <div className="space-y-4">
      <CreatePostCommentForm postId={postId} />
      <CommentTree
        comments={comments}
        emptyMessage="Nie ma jeszcze komentarzy pod tym postem."
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
            <CreatePostCommentForm
              onCancel={() => setReplyCommentId(null)}
              onSuccess={() => setReplyCommentId(null)}
              parentAuthorUsername={comment.authorUsername}
              parentId={comment.id}
              postId={postId}
              submitLabel="Dodaj odpowiedź"
              variant="inline"
            />
          ) : null
        }
      />
    </div>
  )
}
