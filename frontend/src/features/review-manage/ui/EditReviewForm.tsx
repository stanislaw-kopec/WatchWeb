import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Star, X } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { updateWatchReview } from '@/entities/review/api/reviewApi'
import type { Review, UserReview } from '@/entities/review/model/types'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'

const reviewFormSchema = z.object({
  rating: z.number().min(1, 'Ocena musi być od 1 do 10.').max(10, 'Ocena musi być od 1 do 10.'),
  content: z
    .string()
    .trim()
    .min(1, 'Wpisz treść recenzji.')
    .max(5000, 'Recenzja może mieć maksymalnie 5000 znaków.'),
})

type ReviewFormValues = z.infer<typeof reviewFormSchema>

type EditReviewFormProps = {
  review: Review | UserReview
  onCancel: () => void
  onUpdated?: () => void
}

export function EditReviewForm({ review, onCancel, onUpdated }: EditReviewFormProps) {
  const queryClient = useQueryClient()
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: review.rating,
      content: review.content,
    },
  })
  const rating = useWatch({ control: form.control, name: 'rating' }) ?? review.rating
  const content = useWatch({ control: form.control, name: 'content' }) ?? ''

  const updateReviewMutation = useMutation({
    mutationFn: (values: ReviewFormValues) =>
      updateWatchReview(review.watchId, review.id, {
        rating: values.rating,
        content: values.content.trim(),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['watch', review.watchId] }),
        queryClient.invalidateQueries({ queryKey: ['watch-reviews', review.watchId] }),
        queryClient.invalidateQueries({ queryKey: ['my-reviews'] }),
      ])
      onUpdated?.()
    },
  })

  function handleSubmit(values: ReviewFormValues) {
    updateReviewMutation.mutate(values)
  }

  return (
    <form className="space-y-4 rounded-md border border-border bg-secondary/35 p-4" onSubmit={form.handleSubmit(handleSubmit)}>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">Ocena</span>
        <div className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-3">
          <Star className="size-4 fill-accent text-accent" aria-hidden="true" />
          <input
            className="min-w-0 flex-1 accent-[var(--primary)]"
            max="10"
            min="1"
            step="1"
            type="range"
            {...form.register('rating', { valueAsNumber: true })}
          />
          <output className="w-12 text-right text-sm font-semibold text-foreground">{rating}/10</output>
        </div>
        <FormFieldError message={form.formState.errors.rating?.message} />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">Treść recenzji</span>
        <Textarea maxLength={5000} {...form.register('content')} />
        <div className="flex items-center justify-between gap-3">
          <FormFieldError message={form.formState.errors.content?.message} />
          <p className="ml-auto text-xs text-muted-foreground">
            {content.length}/5000
          </p>
        </div>
      </label>

      {updateReviewMutation.isError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {getErrorMessage(updateReviewMutation.error)}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button disabled={updateReviewMutation.isPending} onClick={onCancel} type="button" variant="outline">
          <X className="size-4" aria-hidden="true" />
          Anuluj
        </Button>
        <Button disabled={updateReviewMutation.isPending} type="submit">
          <Save className="size-4" aria-hidden="true" />
          {updateReviewMutation.isPending ? 'Zapisywanie' : 'Zapisz recenzję'}
        </Button>
      </div>
    </form>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się zaktualizować recenzji.'
}
