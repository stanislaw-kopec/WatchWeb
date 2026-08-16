import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LogIn, Send, Star } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'

import { createWatchReview } from '@/entities/review/api/reviewApi'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Textarea } from '@/shared/ui/textarea'

const createReviewSchema = z.object({
  rating: z.number().min(1, 'Ocena musi być od 1 do 10.').max(10, 'Ocena musi być od 1 do 10.'),
  content: z
    .string()
    .trim()
    .min(1, 'Wpisz treść recenzji.')
    .max(5000, 'Recenzja może mieć maksymalnie 5000 znaków.'),
})

type CreateReviewFormValues = z.infer<typeof createReviewSchema>

type CreateReviewFormProps = {
  watchId: string
}

export function CreateReviewForm({ watchId }: CreateReviewFormProps) {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthSession()
  const form = useForm<CreateReviewFormValues>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      rating: 8,
      content: '',
    },
  })
  const rating = useWatch({ control: form.control, name: 'rating' }) ?? 8
  const content = useWatch({ control: form.control, name: 'content' }) ?? ''

  const createReviewMutation = useMutation({
    mutationFn: (values: CreateReviewFormValues) =>
      createWatchReview(watchId, {
        rating: values.rating,
        content: values.content.trim(),
      }),
    onSuccess: async () => {
      form.reset({
        rating: 8,
        content: '',
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['watch', watchId] }),
        queryClient.invalidateQueries({ queryKey: ['watch-reviews', watchId] }),
        queryClient.invalidateQueries({ queryKey: ['my-reviews'] }),
      ])
    },
  })

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dodaj recenzję</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            Recenzje mogą dodawać tylko zalogowani użytkownicy.
          </p>
          <Button asChild>
            <Link to={`/login?redirectTo=${encodeURIComponent(`/watches/${watchId}`)}`}>
              <LogIn className="size-4" aria-hidden="true" />
              Zaloguj się
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  function handleSubmit(values: CreateReviewFormValues) {
    createReviewMutation.mutate(values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dodaj recenzję</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Ocena</span>
            <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/45 px-3 py-3">
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
            <Textarea
              maxLength={5000}
              placeholder="Napisz, jak zegarek nosi się na co dzień, co wypada dobrze, a co warto poprawić."
              {...form.register('content')}
            />
            <div className="flex items-center justify-between gap-3">
              <FormFieldError message={form.formState.errors.content?.message} />
              <p className="ml-auto text-xs text-muted-foreground">
                {content.length}/5000
              </p>
            </div>
          </label>

          {createReviewMutation.isSuccess ? (
            <p className="rounded-md border border-primary/30 bg-secondary p-3 text-sm text-secondary-foreground">
              Recenzja została dodana.
            </p>
          ) : null}

          {createReviewMutation.isError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {getErrorMessage(createReviewMutation.error)}
            </p>
          ) : null}

          <Button className="w-full" disabled={createReviewMutation.isPending} type="submit">
            <Send className="size-4" aria-hidden="true" />
            {createReviewMutation.isPending ? 'Zapisywanie' : 'Dodaj recenzję'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes('already reviewed')) {
    return 'Masz już recenzję dla tego zegarka.'
  }

  return error instanceof Error ? error.message : 'Nie udało się dodać recenzji.'
}
