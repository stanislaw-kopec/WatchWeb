import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Send, X, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { approvePost, rejectPost } from '@/entities/post/api/postApi'
import type { Post } from '@/entities/post/model/types'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'

const rejectPostSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Wpisz powód odrzucenia.')
    .max(500, 'Powód może mieć maksymalnie 500 znaków.'),
})

type RejectPostFormValues = z.infer<typeof rejectPostSchema>

type PostModerationActionsProps = {
  post: Post
}

export function PostModerationActions({ post }: PostModerationActionsProps) {
  const queryClient = useQueryClient()
  const [rejectMode, setRejectMode] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const rejectForm = useForm<RejectPostFormValues>({
    resolver: zodResolver(rejectPostSchema),
    defaultValues: {
      reason: '',
    },
  })
  const reason = useWatch({ control: rejectForm.control, name: 'reason' }) ?? ''

  const approveMutation = useMutation({
    mutationFn: () => approvePost(post.id),
    onSuccess: async () => {
      await invalidatePostQueries(queryClient, post.id)
      setNotice('Post został zatwierdzony i jest widoczny publicznie.')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (values: RejectPostFormValues) =>
      rejectPost(post.id, {
        reason: values.reason.trim(),
      }),
    onSuccess: async () => {
      rejectForm.reset({ reason: '' })
      setRejectMode(false)
      await invalidatePostQueries(queryClient, post.id)
      setNotice('Post został odrzucony, a autor zobaczy powód w swoich postach.')
    },
  })

  if (post.status !== 'PENDING') {
    return (
      <p className="text-sm text-muted-foreground">
        Ten post został już rozpatrzony. Akcje moderacji są dostępne tylko dla statusu oczekującego.
      </p>
    )
  }

  if (rejectMode) {
    return (
      <form className="space-y-3" onSubmit={rejectForm.handleSubmit((values) => rejectMutation.mutate(values))}>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Powód odrzucenia</span>
          <Textarea
            className="min-h-28"
            maxLength={500}
            placeholder="Np. wpis wymaga doprecyzowania albo narusza zasady społeczności."
            {...rejectForm.register('reason')}
          />
          <div className="flex items-center justify-between gap-3">
            <FormFieldError message={rejectForm.formState.errors.reason?.message} />
            <p className="ml-auto text-xs text-muted-foreground">{reason.length}/500</p>
          </div>
        </label>

        {rejectMutation.isError ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {getErrorMessage(rejectMutation.error)}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={rejectMutation.isPending}
            onClick={() => setRejectMode(false)}
            type="button"
            variant="outline"
          >
            <X className="size-4" aria-hidden="true" />
            Anuluj
          </Button>
          <Button
            className="border border-destructive/50 bg-destructive text-white hover:bg-destructive/90"
            disabled={rejectMutation.isPending}
            type="submit"
          >
            <Send className="size-4" aria-hidden="true" />
            {rejectMutation.isPending ? 'Odrzucanie' : 'Odrzuć z powodem'}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-3">
      {notice ? (
        <p className="rounded-md border border-primary/30 bg-secondary p-3 text-sm text-secondary-foreground">
          {notice}
        </p>
      ) : null}

      {approveMutation.isError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {getErrorMessage(approveMutation.error)}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button disabled={approveMutation.isPending} onClick={() => approveMutation.mutate()} type="button">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {approveMutation.isPending ? 'Zatwierdzanie' : 'Zatwierdź'}
        </Button>
        <Button
          className="border-destructive/50 text-destructive hover:bg-destructive/10"
          disabled={approveMutation.isPending}
          onClick={() => setRejectMode(true)}
          type="button"
          variant="outline"
        >
          <XCircle className="size-4" aria-hidden="true" />
          Odrzuć
        </Button>
      </div>
    </div>
  )
}

async function invalidatePostQueries(queryClient: ReturnType<typeof useQueryClient>, postId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['post-moderation'] }),
    queryClient.invalidateQueries({ queryKey: ['posts'] }),
    queryClient.invalidateQueries({ queryKey: ['post', postId] }),
    queryClient.invalidateQueries({ queryKey: ['my-posts'] }),
  ])
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się wykonać akcji moderacji.'
}
