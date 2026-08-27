import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Pencil, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { deleteArticle } from '@/entities/article/api/articleApi'
import type { Article } from '@/entities/article/model/types'
import { Button } from '@/shared/ui/button'

type ArticleActionsProps = {
  article: Article
  afterDeletePath?: string
}

export function ArticleActions({ article, afterDeletePath = '/articles' }: ArticleActionsProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const deleteArticleMutation = useMutation({
    mutationFn: () => deleteArticle(article.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['articles'] }),
        queryClient.invalidateQueries({ queryKey: ['article', article.id] }),
        queryClient.invalidateQueries({ queryKey: ['my-article', article.id] }),
        queryClient.invalidateQueries({ queryKey: ['my-articles'] }),
      ])
      navigate(afterDeletePath)
    },
  })

  if (isConfirmingDelete) {
    return (
      <div className="space-y-4 rounded-md border border-destructive/40 bg-destructive/10 p-4">
        <div>
          <p className="font-medium text-destructive">Usunąć artykuł?</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {article.status === 'DRAFT'
              ? 'Wersja robocza zniknie z Twojej listy.'
              : 'Artykuł zniknie z publicznej listy i szczegółów.'}
          </p>
        </div>

        {deleteArticleMutation.isError ? (
          <p className="rounded-md border border-destructive/40 bg-card p-3 text-sm text-destructive">
            {getErrorMessage(deleteArticleMutation.error)}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={deleteArticleMutation.isPending} onClick={() => setIsConfirmingDelete(false)} type="button" variant="outline">
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
            {deleteArticleMutation.isPending ? 'Usuwanie…' : 'Usuń artykuł'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline">
        <Link to={`/me/articles/${article.id}/edit`}>
          <Pencil className="size-4" aria-hidden="true" />
          Edytuj
        </Link>
      </Button>
      {article.status === 'PUBLISHED' ? (
        <Button asChild variant="outline">
          <Link to={`/articles/${article.id}`}>
            <ExternalLink className="size-4" aria-hidden="true" />
            Zobacz
          </Link>
        </Button>
      ) : null}
      <Button
        className="border-destructive/50 text-destructive hover:bg-destructive/10"
        onClick={() => setIsConfirmingDelete(true)}
        type="button"
        variant="outline"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        Usuń
      </Button>
    </div>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się usunąć artykułu.'
}
