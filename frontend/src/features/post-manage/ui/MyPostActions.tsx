import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Pencil, Trash2, X } from 'lucide-react'
import { useState } from 'react'

import { deletePost } from '@/entities/post/api/postApi'
import type { Post } from '@/entities/post/model/types'
import { Button } from '@/shared/ui/button'
import { EditPostForm } from '@/features/post-manage/ui/EditPostForm'
import { PostImageUploadForm } from '@/features/post-manage/ui/PostImageUploadForm'

type ManageMode = 'idle' | 'edit' | 'image' | 'delete'

type MyPostActionsProps = {
  post: Post
}

export function MyPostActions({ post }: MyPostActionsProps) {
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<ManageMode>('idle')
  const [notice, setNotice] = useState<string | null>(null)

  const deletePostMutation = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['post', post.id] }),
        queryClient.invalidateQueries({ queryKey: ['my-posts'] }),
      ])
    },
  })

  if (mode === 'edit') {
    return (
      <EditPostForm
        onCancel={() => setMode('idle')}
        onUpdated={() => {
          setNotice('Post został zapisany i wrócił do moderacji.')
          setMode('idle')
        }}
        post={post}
      />
    )
  }

  if (mode === 'image') {
    return (
      <PostImageUploadForm
        onCancel={() => setMode('idle')}
        onUploaded={() => {
          setNotice('Zdjęcie zostało zapisane, a post wrócił do moderacji.')
          setMode('idle')
        }}
        post={post}
      />
    )
  }

  if (mode === 'delete') {
    return (
      <div className="space-y-4 rounded-md border border-destructive/40 bg-destructive/10 p-4">
        <div>
          <p className="font-medium text-destructive">Usunąć post?</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Post zostanie ukryty i zniknie z Twojej listy.
          </p>
        </div>

        {deletePostMutation.isError ? (
          <p className="rounded-md border border-destructive/40 bg-card p-3 text-sm text-destructive">
            {getErrorMessage(deletePostMutation.error)}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={deletePostMutation.isPending}
            onClick={() => setMode('idle')}
            type="button"
            variant="outline"
          >
            <X className="size-4" aria-hidden="true" />
            Anuluj
          </Button>
          <Button
            className="border border-destructive/50 bg-destructive text-white hover:bg-destructive/90"
            disabled={deletePostMutation.isPending}
            onClick={() => deletePostMutation.mutate()}
            type="button"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {deletePostMutation.isPending ? 'Usuwanie' : 'Usuń post'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notice ? (
        <p className="rounded-md border border-primary/30 bg-secondary p-3 text-sm text-secondary-foreground">
          {notice}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setMode('edit')} type="button" variant="outline">
          <Pencil className="size-4" aria-hidden="true" />
          Edytuj
        </Button>
        <Button onClick={() => setMode('image')} type="button" variant="outline">
          <ImagePlus className="size-4" aria-hidden="true" />
          Zdjęcie
        </Button>
        <Button
          className="border-destructive/50 text-destructive hover:bg-destructive/10"
          onClick={() => setMode('delete')}
          type="button"
          variant="outline"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Usuń
        </Button>
      </div>
    </div>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się usunąć posta.'
}
