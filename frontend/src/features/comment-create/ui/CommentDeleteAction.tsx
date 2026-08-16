import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, X } from 'lucide-react'
import { useState } from 'react'

import { deletePostComment, deleteWatchComment } from '@/entities/comment/api/commentApi'
import { Button } from '@/shared/ui/button'

type CommentTarget =
  | {
      type: 'watch'
      resourceId: string
    }
  | {
      type: 'post'
      resourceId: string
    }

type CommentDeleteActionProps = {
  commentId: string
  target: CommentTarget
}

export function CommentDeleteAction({ commentId, target }: CommentDeleteActionProps) {
  const queryClient = useQueryClient()
  const [confirming, setConfirming] = useState(false)

  const deleteCommentMutation = useMutation({
    mutationFn: () =>
      target.type === 'watch'
        ? deleteWatchComment(target.resourceId, commentId)
        : deletePostComment(target.resourceId, commentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [target.type === 'watch' ? 'watch-comments' : 'post-comments', target.resourceId],
      })
      setConfirming(false)
    },
  })

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          disabled={deleteCommentMutation.isPending}
          onClick={() => setConfirming(false)}
          size="sm"
          type="button"
          variant="outline"
        >
          <X className="size-4" aria-hidden="true" />
          Anuluj
        </Button>
        <Button
          className="border border-destructive/50 bg-destructive text-white hover:bg-destructive/90"
          disabled={deleteCommentMutation.isPending}
          onClick={() => deleteCommentMutation.mutate()}
          size="sm"
          type="button"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          {deleteCommentMutation.isPending ? 'Usuwanie' : 'Usuń'}
        </Button>
        {deleteCommentMutation.isError ? (
          <p className="w-full text-sm text-destructive">{getErrorMessage(deleteCommentMutation.error)}</p>
        ) : null}
      </div>
    )
  }

  return (
    <Button
      className="text-destructive hover:bg-destructive/10"
      onClick={() => setConfirming(true)}
      size="sm"
      type="button"
      variant="ghost"
    >
      <Trash2 className="size-4" aria-hidden="true" />
      Usuń
    </Button>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się usunąć komentarza.'
}
