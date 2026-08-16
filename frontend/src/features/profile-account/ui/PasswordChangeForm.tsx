import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { KeyRound } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { updateCurrentUserPassword } from '@/entities/user/api/userApi'
import {
  passwordFormSchema,
  PASSWORD_MAX_LENGTH,
} from '@/features/profile-account/model/profileAccountForms'
import type { PasswordFormValues } from '@/features/profile-account/model/profileAccountForms'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

export function PasswordChangeForm() {
  const { signOut } = useAuthSession()
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const updatePasswordMutation = useMutation({
    mutationFn: (values: PasswordFormValues) =>
      updateCurrentUserPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: async () => {
      form.reset()
      await signOut()
    },
  })

  function handleSubmit(values: PasswordFormValues) {
    updatePasswordMutation.mutate(values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zmiana hasła</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Obecne hasło</span>
            <Input autoComplete="current-password" type="password" {...form.register('currentPassword')} />
            <FormFieldError message={form.formState.errors.currentPassword?.message} />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Nowe hasło</span>
            <Input
              autoComplete="new-password"
              maxLength={PASSWORD_MAX_LENGTH}
              type="password"
              {...form.register('newPassword')}
            />
            <FormFieldError message={form.formState.errors.newPassword?.message} />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Powtórz nowe hasło</span>
            <Input
              autoComplete="new-password"
              maxLength={PASSWORD_MAX_LENGTH}
              type="password"
              {...form.register('confirmNewPassword')}
            />
            <FormFieldError message={form.formState.errors.confirmNewPassword?.message} />
          </label>

          {updatePasswordMutation.isError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {getErrorMessage(updatePasswordMutation.error)}
            </p>
          ) : null}

          <Button disabled={updatePasswordMutation.isPending} type="submit">
            <KeyRound className="size-4" aria-hidden="true" />
            {updatePasswordMutation.isPending ? 'Zapisywanie' : 'Zmień hasło'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się zmienić hasła.'
}
