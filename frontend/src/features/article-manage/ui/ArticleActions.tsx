import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Pencil, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { deleteArticle } from '@/entities/article/api/articleApi'
import type { Article } from '@/entities/article/model/types'
import { ArticleHeaderImageUploadForm } from '@/features/article-manage/ui/ArticleHeaderImageUploadForm'
import { EditArticleForm } from '@/features/article-manage/ui/EditArticleForm'
import { Button } from '@/shared/ui/button'

type ManageMode = 'idle' | 'edit' | 'image' | 'delete'

type ArticleActionsProps = {
  article: Article
}

export function ArticleActions({ article }: ArticleActionsProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<ManageMode>('idle')
  const [notice, setNotice] = useState<string | null>(null)

  const deleteArticleMutation = useMutation({
    mutationFn: () => deleteArticle(article.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['articles'] }),
        queryClient.invalidateQueries({ queryKey: ['article', article.id] }),
      ])
      navigate('/articles')
    },
  })

  if (mode === 'edit') {
    return (
      <EditArticleForm
        article={article}
        onCancel={() => setMode('idle')}
        onUpdated={() => {
          setNotice('Artykuł został zapisany.')
          setMode('idle')
        }}
      />
    )
  }

  if (mode === 'image') {
    return (
      <ArticleHeaderImageUploadForm
        article={article}
        onCancel={() => setMode('idle')}
        onUploaded={() => {
          setNotice('Obrazek nagłówkowy został zapisany.')
          setMode('idle')
        }}
      />
    )
  }

  if (mode === 'delete') {
    return (
      <div className="space-y-4 rounded-md border border-destructive/40 bg-destructive/10 p-4">
        <div>
          <p className="font-medium text-destructive">Usunąć artykuł?</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Artykuł zniknie z publicznej listy i szczegółów.
          </p>
        </div>

        {deleteArticleMutation.isError ? (
          <p className="rounded-md border border-destructive/40 bg-card p-3 text-sm text-destructive">
            {getErrorMessage(deleteArticleMutation.error)}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={deleteArticleMutation.isPending}
            onClick={() => setMode('idle')}
            type="button"
            variant="outline"
          >
            <X className="size-4" aria-hidden="true" />
            Anuluj
          </Button>
          <Button
            className="border border-destructive/50 bg-destructive text-white hover:bg-destructive/90"
            disabled={deleteArticleMutation.isPending}
            onClick={() => deleteArticleMutation.mutate()}
            type="button"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {deleteArticleMutation.isPending ? 'Usuwanie' : 'Usuń artykuł'}
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
          Obrazek
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
  return error instanceof Error ? error.message : 'Nie udało się usunąć artykułu.'
}
