import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2, X } from 'lucide-react'
import { useState } from 'react'

import { deleteWatchReview } from '@/entities/review/api/reviewApi'
import type { Review, UserReview } from '@/entities/review/model/types'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { EditReviewForm } from '@/features/review-manage/ui/EditReviewForm'
import { Button } from '@/shared/ui/button'

type ReviewActionMode = 'idle' | 'edit' | 'delete'

type ReviewActionsProps = {
  review: Review | UserReview
  reviewerId?: string
}

export function ReviewActions({ review, reviewerId }: ReviewActionsProps) {
  const queryClient = useQueryClient()
  const { user } = useAuthSession()
  const [mode, setMode] = useState<ReviewActionMode>('idle')
  const [notice, setNotice] = useState<string | null>(null)
  const isOwner = reviewerId ? user?.id === reviewerId : true
  const canDelete = isOwner || user?.role === 'ROLE_MODERATOR' || user?.role === 'ROLE_ADMIN'

  const deleteReviewMutation = useMutation({
    mutationFn: () => deleteWatchReview(review.watchId, review.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['watch', review.watchId] }),
        queryClient.invalidateQueries({ queryKey: ['watch-reviews', review.watchId] }),
        queryClient.invalidateQueries({ queryKey: ['my-reviews'] }),
      ])
      setNotice('Recenzja została usunięta.')
      setMode('idle')
    },
  })

  if (!user || (!isOwner && !canDelete)) {
    return null
  }

  if (mode === 'edit' && isOwner) {
    return (
      <EditReviewForm
        onCancel={() => setMode('idle')}
        onUpdated={() => {
          setNotice('Recenzja została zaktualizowana.')
          setMode('idle')
        }}
        review={review}
      />
    )
  }

  if (mode === 'delete') {
    return (
      <div className="space-y-4 rounded-md border border-destructive/40 bg-destructive/10 p-4">
        <div>
          <p className="font-medium text-destructive">Usunąć recenzję?</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Ocena zniknie z listy i zostanie odjęta od średniej zegarka.
          </p>
        </div>

        {deleteReviewMutation.isError ? (
          <p className="rounded-md border border-destructive/40 bg-card p-3 text-sm text-destructive">
            {getErrorMessage(deleteReviewMutation.error)}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={deleteReviewMutation.isPending}
            onClick={() => setMode('idle')}
            type="button"
            variant="outline"
          >
            <X className="size-4" aria-hidden="true" />
            Anuluj
          </Button>
          <Button
            className="border border-destructive/50 bg-destructive text-white hover:bg-destructive/90"
            disabled={deleteReviewMutation.isPending}
            onClick={() => deleteReviewMutation.mutate()}
            type="button"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {deleteReviewMutation.isPending ? 'Usuwanie' : 'Usuń recenzję'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notice ? (
        <p className="rounded-md border border-primary/30 bg-secondary p-3 text-sm text-secondary-foreground">
          {notice}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {isOwner ? (
          <Button onClick={() => setMode('edit')} type="button" variant="outline">
            <Pencil className="size-4" aria-hidden="true" />
            Edytuj
          </Button>
        ) : null}
        {canDelete ? (
          <Button
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={() => setMode('delete')}
            type="button"
            variant="outline"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Usuń
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się usunąć recenzji.'
}
