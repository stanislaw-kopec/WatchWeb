import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { deleteCurrentUser } from '@/entities/user/api/userApi'
import type { User } from '@/entities/user/model/types'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

type AccountDeletionPanelProps = {
  user: User
}

export function AccountDeletionPanel({ user }: AccountDeletionPanelProps) {
  const queryClient = useQueryClient()
  const { signOut } = useAuthSession()
  const [confirmation, setConfirmation] = useState('')
  const canDelete = confirmation === user.username

  const deleteAccountMutation = useMutation({
    mutationFn: deleteCurrentUser,
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ['current-user'] })
      queryClient.removeQueries({ queryKey: ['user', user.id] })
      await signOut()
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (canDelete) {
      deleteAccountMutation.mutate()
    }
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>Usunięcie konta</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <p className="text-sm leading-6 text-muted-foreground">
            Konto zostanie zanonimizowane, a historyczne treści pozostaną w aplikacji bez danych osobowych.
          </p>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Wpisz nazwę użytkownika</span>
            <Input
              autoComplete="off"
              onChange={(event) => setConfirmation(event.target.value)}
              value={confirmation}
            />
          </label>

          {deleteAccountMutation.isError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {getErrorMessage(deleteAccountMutation.error)}
            </p>
          ) : null}

          <Button
            className="border border-destructive/40 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={!canDelete || deleteAccountMutation.isPending}
            type="submit"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {deleteAccountMutation.isPending ? 'Usuwanie' : 'Usuń konto'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się usunąć konta.'
}
