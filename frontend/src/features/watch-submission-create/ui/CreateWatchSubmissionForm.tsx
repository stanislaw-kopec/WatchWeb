import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'

import { createWatchSubmission } from '@/entities/watch/api/watchSubmissionApi'
import { MOVEMENT_TYPE_OPTIONS } from '@/entities/watch/model/movementType'
import type { WatchSubmissionResponse } from '@/entities/watch/model/submissionTypes'
import {
  createWatchSubmissionRequestFromForm,
  getDefaultWatchSubmissionFormValues,
  WATCH_SUBMISSION_BRAND_MAX_LENGTH,
  WATCH_SUBMISSION_DETAIL_TEXT_MAX_LENGTH,
  WATCH_SUBMISSION_MODEL_MAX_LENGTH,
  WATCH_SUBMISSION_REFERENCE_MAX_LENGTH,
  watchSubmissionFormSchema,
} from '@/features/watch-submission-create/model/watchSubmissionForm'
import type { WatchSubmissionFormValues } from '@/features/watch-submission-create/model/watchSubmissionForm'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'

type CreateWatchSubmissionFormProps = {
  onCreated?: (submission: WatchSubmissionResponse) => void
}

export function CreateWatchSubmissionForm({ onCreated }: CreateWatchSubmissionFormProps) {
  const queryClient = useQueryClient()
  const form = useForm<WatchSubmissionFormValues>({
    resolver: zodResolver(watchSubmissionFormSchema),
    defaultValues: getDefaultWatchSubmissionFormValues(),
  })
  const brand = useWatch({ control: form.control, name: 'brand' }) ?? ''
  const model = useWatch({ control: form.control, name: 'model' }) ?? ''
  const referenceCode = useWatch({ control: form.control, name: 'referenceCode' }) ?? ''

  const createSubmissionMutation = useMutation({
    mutationFn: (values: WatchSubmissionFormValues) =>
      createWatchSubmission(createWatchSubmissionRequestFromForm(values)),
    onSuccess: async (createdSubmission) => {
      form.reset(getDefaultWatchSubmissionFormValues())
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-watch-submissions'] }),
        queryClient.invalidateQueries({ queryKey: ['watch-submission-moderation'] }),
      ])
      onCreated?.(createdSubmission)
    },
  })

  function handleSubmit(values: WatchSubmissionFormValues) {
    createSubmissionMutation.mutate(values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dane zegarka</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Marka</span>
              <Input
                maxLength={WATCH_SUBMISSION_BRAND_MAX_LENGTH}
                placeholder="Np. Seiko"
                {...form.register('brand')}
              />
              <div className="flex items-center justify-between gap-3">
                <FormFieldError message={form.formState.errors.brand?.message} />
                <p className="ml-auto text-xs text-muted-foreground">
                  {brand.length}/{WATCH_SUBMISSION_BRAND_MAX_LENGTH}
                </p>
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Model</span>
              <Input
                maxLength={WATCH_SUBMISSION_MODEL_MAX_LENGTH}
                placeholder="Np. SKX007"
                {...form.register('model')}
              />
              <div className="flex items-center justify-between gap-3">
                <FormFieldError message={form.formState.errors.model?.message} />
                <p className="ml-auto text-xs text-muted-foreground">
                  {model.length}/{WATCH_SUBMISSION_MODEL_MAX_LENGTH}
                </p>
              </div>
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm font-medium text-foreground">Kod referencyjny</span>
              <Input
                maxLength={WATCH_SUBMISSION_REFERENCE_MAX_LENGTH}
                placeholder="Np. SKX007K2"
                {...form.register('referenceCode')}
              />
              <div className="flex items-center justify-between gap-3">
                <FormFieldError message={form.formState.errors.referenceCode?.message} />
                <p className="ml-auto text-xs text-muted-foreground">
                  {referenceCode.length}/{WATCH_SUBMISSION_REFERENCE_MAX_LENGTH}
                </p>
              </div>
            </label>
          </div>

          <div className="grid gap-4 border-t border-border pt-6 md:grid-cols-2 xl:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Typ mechanizmu</span>
              <Select {...form.register('movementType')}>
                <option value="">Brak danych</option>
                {MOVEMENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <FormFieldError message={form.formState.errors.movementType?.message} />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Kaliber</span>
              <Input
                maxLength={WATCH_SUBMISSION_DETAIL_TEXT_MAX_LENGTH}
                placeholder="Np. 7S26"
                {...form.register('caliber')}
              />
              <FormFieldError message={form.formState.errors.caliber?.message} />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Średnica koperty</span>
              <Input
                inputMode="decimal"
                placeholder="Np. 42.5"
                {...form.register('caseDiameterMm')}
              />
              <FormFieldError message={form.formState.errors.caseDiameterMm?.message} />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Grubość koperty</span>
              <Input
                inputMode="decimal"
                placeholder="Np. 13.25"
                {...form.register('caseThicknessMm')}
              />
              <FormFieldError message={form.formState.errors.caseThicknessMm?.message} />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Lug to lug</span>
              <Input
                inputMode="decimal"
                placeholder="Np. 46"
                {...form.register('lugToLugMm')}
              />
              <FormFieldError message={form.formState.errors.lugToLugMm?.message} />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Szerokość paska</span>
              <Input
                inputMode="decimal"
                placeholder="Np. 22"
                {...form.register('strapWidthMm')}
              />
              <FormFieldError message={form.formState.errors.strapWidthMm?.message} />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Wodoszczelność</span>
              <Input
                inputMode="numeric"
                placeholder="Np. 200"
                {...form.register('waterResistanceM')}
              />
              <FormFieldError message={form.formState.errors.waterResistanceM?.message} />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Szkło</span>
              <Input
                maxLength={WATCH_SUBMISSION_DETAIL_TEXT_MAX_LENGTH}
                placeholder="Np. Hardlex"
                {...form.register('crystalType')}
              />
              <FormFieldError message={form.formState.errors.crystalType?.message} />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Materiał koperty</span>
              <Input
                maxLength={WATCH_SUBMISSION_DETAIL_TEXT_MAX_LENGTH}
                placeholder="Np. stal nierdzewna"
                {...form.register('caseMaterial')}
              />
              <FormFieldError message={form.formState.errors.caseMaterial?.message} />
            </label>
          </div>

          {createSubmissionMutation.isError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {getErrorMessage(createSubmissionMutation.error)}
            </p>
          ) : null}

          <Button className="w-full" disabled={createSubmissionMutation.isPending} type="submit">
            <Send className="size-4" aria-hidden="true" />
            {createSubmissionMutation.isPending ? 'Wysyłanie' : 'Wyślij do moderacji'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.toLowerCase().includes('already')) {
    return 'Taki zegarek już istnieje w katalogu albo czeka na moderację.'
  }

  return error instanceof Error ? error.message : 'Nie udało się wysłać zgłoszenia.'
}
