import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Upload, X } from 'lucide-react'
import { useState } from 'react'

import { updatePostImage } from '@/entities/post/api/postApi'
import type { Post } from '@/entities/post/model/types'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

type PostImageUploadFormProps = {
  post: Post
  onCancel: () => void
  onUploaded?: (post: Post) => void
}

export function PostImageUploadForm({ post, onCancel, onUploaded }: PostImageUploadFormProps) {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const uploadImageMutation = useMutation({
    mutationFn: (selectedFile: File) => updatePostImage(post.id, selectedFile),
    onSuccess: async (updatedPost) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['post', post.id] }),
        queryClient.invalidateQueries({ queryKey: ['my-posts'] }),
      ])
      onUploaded?.(updatedPost)
    },
  })

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null

    setFile(selectedFile)
    setLocalError(validateFile(selectedFile))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const error = validateFile(file)
    setLocalError(error)

    if (!file || error) {
      return
    }

    uploadImageMutation.mutate(file)
  }

  return (
    <form className="space-y-4 rounded-md border border-border bg-secondary/35 p-4" onSubmit={handleSubmit}>
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
          <ImagePlus className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-foreground">Zdjęcie posta</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Akceptowane formaty: JPG, PNG i WEBP do 5 MB.
            {post.status === 'DRAFT' ? ' Szkic pozostanie prywatny.' : ' Zmiana zdjęcia wraca do moderacji.'}
          </p>
        </div>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">Plik</span>
        <Input accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} type="file" />
      </label>

      {localError || uploadImageMutation.isError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {localError ?? getErrorMessage(uploadImageMutation.error)}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button disabled={uploadImageMutation.isPending} onClick={onCancel} type="button" variant="outline">
          <X className="size-4" aria-hidden="true" />
          Anuluj
        </Button>
        <Button disabled={!file || Boolean(localError) || uploadImageMutation.isPending} type="submit">
          <Upload className="size-4" aria-hidden="true" />
          {uploadImageMutation.isPending ? 'Wysyłanie' : 'Wyślij zdjęcie'}
        </Button>
      </div>
    </form>
  )
}

function validateFile(file: File | null) {
  if (!file) {
    return 'Wybierz plik zdjęcia.'
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Dozwolone są tylko pliki JPG, PNG albo WEBP.'
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Plik może mieć maksymalnie 5 MB.'
  }

  return null
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się wysłać zdjęcia.'
}
