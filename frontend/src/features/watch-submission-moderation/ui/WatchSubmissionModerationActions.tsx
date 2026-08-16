import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, ExternalLink, Send, X, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'

import {
  approveWatchSubmission,
  rejectWatchSubmission,
} from '@/entities/watch/api/watchSubmissionApi'
import type { ModerationWatchSubmission } from '@/entities/watch/model/submissionTypes'
import type { Watch } from '@/entities/watch/model/types'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'

const rejectWatchSubmissionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Wpisz powód odrzucenia.')
    .max(500, 'Powód może mieć maksymalnie 500 znaków.'),
})

type RejectWatchSubmissionFormValues = z.infer<typeof rejectWatchSubmissionSchema>

type WatchSubmissionModerationActionsProps = {
  submission: ModerationWatchSubmission
}

export function WatchSubmissionModerationActions({
  submission,
}: WatchSubmissionModerationActionsProps) {
  const queryClient = useQueryClient()
  const [rejectMode, setRejectMode] = useState(false)
  const [createdWatch, setCreatedWatch] = useState<Watch | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const rejectForm = useForm<RejectWatchSubmissionFormValues>({
    resolver: zodResolver(rejectWatchSubmissionSchema),
    defaultValues: {
      reason: '',
    },
  })
  const reason = useWatch({ control: rejectForm.control, name: 'reason' }) ?? ''

  const approveMutation = useMutation({
    mutationFn: () => approveWatchSubmission(submission.id),
    onSuccess: async (watch) => {
      setCreatedWatch(watch)
      await invalidateWatchSubmissionQueries(queryClient)
      setNotice('Zgłoszenie zostało zatwierdzone i utworzyło wpis w katalogu.')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (values: RejectWatchSubmissionFormValues) =>
      rejectWatchSubmission(submission.id, {
        reason: values.reason.trim(),
      }),
    onSuccess: async () => {
      rejectForm.reset({ reason: '' })
      setRejectMode(false)
      await invalidateWatchSubmissionQueries(queryClient)
      setNotice('Zgłoszenie zostało odrzucone, a autor zobaczy powód w swoich zgłoszeniach.')
    },
  })

  if (submission.status !== 'PENDING') {
    return (
      <p className="text-sm text-muted-foreground">
        To zgłoszenie zostało już rozpatrzone. Akcje są dostępne tylko dla statusu oczekującego.
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
            placeholder="Np. model już istnieje w katalogu albo zgłoszenie wymaga uzupełnienia danych."
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
        <div className="rounded-md border border-primary/30 bg-secondary p-3 text-sm text-secondary-foreground">
          <p>{notice}</p>
          {createdWatch ? (
            <Button asChild className="mt-3" size="sm" variant="outline">
              <Link to={`/watches/${createdWatch.id}`}>
                <ExternalLink className="size-4" aria-hidden="true" />
                Otwórz zegarek
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}

      {approveMutation.isError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {getErrorMessage(approveMutation.error)}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button disabled={approveMutation.isPending} onClick={() => approveMutation.mutate()} type="button">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {approveMutation.isPending ? 'Zatwierdzanie' : 'Zatwierdź i utwórz zegarek'}
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

async function invalidateWatchSubmissionQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['watch-submission-moderation'] }),
    queryClient.invalidateQueries({ queryKey: ['watch-submissions-me'] }),
    queryClient.invalidateQueries({ queryKey: ['watches'] }),
  ])
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się wykonać akcji moderacji.'
}
