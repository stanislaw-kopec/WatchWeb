import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImageUp, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { updateCurrentUserAvatar } from '@/entities/user/api/userApi'
import type { User } from '@/entities/user/model/types'
import { UserAvatar } from '@/entities/user/ui/UserAvatar'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

type AvatarUploadFormProps = {
  user: User
}

export function AvatarUploadForm({ user }: AvatarUploadFormProps) {
  const queryClient = useQueryClient()
  const { updateUser } = useAuthSession()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const uploadAvatarMutation = useMutation({
    mutationFn: () => {
      if (!file) {
        throw new Error('Wybierz plik avatara.')
      }

      return updateCurrentUserAvatar(file)
    },
    onSuccess: async (updatedUser) => {
      updateUser(updatedUser)
      setFile(null)
      setPreviewUrl(null)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['current-user'] }),
        queryClient.invalidateQueries({ queryKey: ['user', updatedUser.id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
      ])
    },
  })

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null

    setFileError(null)
    uploadAvatarMutation.reset()

    if (!selectedFile) {
      setFile(null)
      setPreviewUrl(null)
      return
    }

    if (!ALLOWED_AVATAR_TYPES.includes(selectedFile.type)) {
      setFile(null)
      setPreviewUrl(null)
      setFileError('Wybierz plik JPG, PNG albo WEBP.')
      return
    }

    if (selectedFile.size > MAX_AVATAR_SIZE_BYTES) {
      setFile(null)
      setPreviewUrl(null)
      setFileError('Avatar może mieć maksymalnie 5 MB.')
      return
    }

    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    uploadAvatarMutation.mutate()
  }

  const previewUser = previewUrl ? { ...user, avatarUrl: previewUrl } : user

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avatar</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <UserAvatar className="size-24" iconClassName="size-12" user={previewUser} />
            <label className="grid flex-1 gap-2">
              <span className="text-sm font-medium text-foreground">Plik obrazu</span>
              <input
                accept="image/jpeg,image/png,image/webp"
                className="block w-full text-sm text-muted-foreground file:mr-3 file:h-9 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:text-sm file:font-medium file:text-secondary-foreground"
                onChange={handleFileChange}
                type="file"
              />
            </label>
          </div>

          {file ? (
            <p className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/45 px-3 py-2 text-sm text-muted-foreground">
              <ImageUp className="size-4" aria-hidden="true" />
              {file.name}
            </p>
          ) : null}

          {fileError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {fileError}
            </p>
          ) : null}

          {uploadAvatarMutation.isSuccess ? (
            <p className="rounded-md border border-primary/30 bg-secondary p-3 text-sm text-secondary-foreground">
              Avatar został zaktualizowany.
            </p>
          ) : null}

          {uploadAvatarMutation.isError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {getErrorMessage(uploadAvatarMutation.error)}
            </p>
          ) : null}

          <Button disabled={!file || uploadAvatarMutation.isPending} type="submit">
            <Upload className="size-4" aria-hidden="true" />
            {uploadAvatarMutation.isPending ? 'Wysyłanie' : 'Zapisz avatar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się zaktualizować avatara.'
}
