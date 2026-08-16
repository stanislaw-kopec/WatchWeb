import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { updateCurrentUser } from '@/entities/user/api/userApi'
import type { User } from '@/entities/user/model/types'
import {
  PROFILE_EMAIL_MAX_LENGTH,
  PROFILE_USERNAME_MAX_LENGTH,
  profileFormSchema,
} from '@/features/profile-account/model/profileAccountForms'
import type { ProfileFormValues } from '@/features/profile-account/model/profileAccountForms'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

type ProfileEditFormProps = {
  user: User
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const queryClient = useQueryClient()
  const { updateUser } = useAuthSession()
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
    },
  })
  const username = useWatch({ control: form.control, name: 'username' }) ?? ''
  const email = useWatch({ control: form.control, name: 'email' }) ?? ''

  useEffect(() => {
    form.reset({
      username: user.username,
      email: user.email,
    })
  }, [form, user.email, user.username])

  const updateProfileMutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      updateCurrentUser({
        username: values.username.trim(),
        email: values.email.trim(),
      }),
    onSuccess: async (updatedUser) => {
      updateUser(updatedUser)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['current-user'] }),
        queryClient.invalidateQueries({ queryKey: ['user', updatedUser.id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
      ])
    },
  })

  function handleSubmit(values: ProfileFormValues) {
    updateProfileMutation.mutate(values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edytuj profil</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Nazwa użytkownika</span>
            <Input maxLength={PROFILE_USERNAME_MAX_LENGTH} {...form.register('username')} />
            <div className="flex items-center justify-between gap-3">
              <FormFieldError message={form.formState.errors.username?.message} />
              <p className="ml-auto text-xs text-muted-foreground">
                {username.length}/{PROFILE_USERNAME_MAX_LENGTH}
              </p>
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Email</span>
            <Input maxLength={PROFILE_EMAIL_MAX_LENGTH} type="email" {...form.register('email')} />
            <div className="flex items-center justify-between gap-3">
              <FormFieldError message={form.formState.errors.email?.message} />
              <p className="ml-auto text-xs text-muted-foreground">
                {email.length}/{PROFILE_EMAIL_MAX_LENGTH}
              </p>
            </div>
          </label>

          {updateProfileMutation.isSuccess ? (
            <p className="rounded-md border border-primary/30 bg-secondary p-3 text-sm text-secondary-foreground">
              Profil został zaktualizowany.
            </p>
          ) : null}

          {updateProfileMutation.isError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {getErrorMessage(updateProfileMutation.error)}
            </p>
          ) : null}

          <Button disabled={updateProfileMutation.isPending} type="submit">
            <Save className="size-4" aria-hidden="true" />
            {updateProfileMutation.isPending ? 'Zapisywanie' : 'Zapisz zmiany'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.toLowerCase().includes('already')) {
    return 'Ta nazwa użytkownika albo email są już zajęte.'
  }

  return error instanceof Error ? error.message : 'Nie udało się zaktualizować profilu.'
}
