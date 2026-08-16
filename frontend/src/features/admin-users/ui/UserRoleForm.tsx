import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, ShieldAlert } from 'lucide-react'
import { useState } from 'react'

import { updateUserRole } from '@/entities/user/api/userApi'
import type { User, UserRole } from '@/entities/user/model/types'
import {
  USER_ROLE_DESCRIPTIONS,
  USER_ROLE_LABELS,
  USER_ROLE_OPTIONS,
} from '@/entities/user/model/roleLabels'
import { Button } from '@/shared/ui/button'
import { Select } from '@/shared/ui/select'

type UserRoleFormProps = {
  user: User
  currentUserId: string | undefined
}

export function UserRoleForm({ user, currentUserId }: UserRoleFormProps) {
  const queryClient = useQueryClient()
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role)
  const isCurrentAdmin = user.id === currentUserId && user.role === 'ROLE_ADMIN'
  const hasChanged = selectedRole !== user.role

  const updateRoleMutation = useMutation({
    mutationFn: () => updateUserRole(user.id, { role: selectedRole }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
        queryClient.invalidateQueries({ queryKey: ['current-user'] }),
      ])
    },
  })

  return (
    <div className="space-y-3">
      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Rola</span>
          <Select
            disabled={isCurrentAdmin || updateRoleMutation.isPending}
            onChange={(event) => setSelectedRole(event.target.value as UserRole)}
            value={selectedRole}
          >
            {USER_ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {USER_ROLE_LABELS[role]}
              </option>
            ))}
          </Select>
        </label>

        <div className="flex items-end">
          <Button disabled={isCurrentAdmin || !hasChanged || updateRoleMutation.isPending} type="button" onClick={() => updateRoleMutation.mutate()}>
            <Save className="size-4" aria-hidden="true" />
            {updateRoleMutation.isPending ? 'Zapisywanie' : 'Zapisz rolę'}
          </Button>
        </div>
      </div>

      <p className="text-sm leading-6 text-muted-foreground">
        {USER_ROLE_DESCRIPTIONS[selectedRole]}
      </p>

      {isCurrentAdmin ? (
        <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Nie możesz odebrać roli administratora własnemu kontu.
        </p>
      ) : null}

      {updateRoleMutation.isSuccess ? (
        <p className="rounded-md border border-primary/30 bg-secondary p-3 text-sm text-secondary-foreground">
          Rola została zaktualizowana.
        </p>
      ) : null}

      {updateRoleMutation.isError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {getErrorMessage(updateRoleMutation.error)}
        </p>
      ) : null}
    </div>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się zmienić roli użytkownika.'
}
