import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, X } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'

import { updateArticle } from '@/entities/article/api/articleApi'
import type { Article } from '@/entities/article/model/types'
import { ARTICLE_CONTENT_MAX_LENGTH, ARTICLE_TITLE_MAX_LENGTH, articleFormSchema } from '@/features/article-manage/model/articleForm'
import type { ArticleFormValues } from '@/features/article-manage/model/articleForm'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

type EditArticleFormProps = {
  article: Article
  onCancel: () => void
  onUpdated?: (article: Article) => void
}

export function EditArticleForm({ article, onCancel, onUpdated }: EditArticleFormProps) {
  const queryClient = useQueryClient()
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: article.title,
      content: article.content,
    },
  })
  const title = useWatch({ control: form.control, name: 'title' }) ?? ''
  const content = useWatch({ control: form.control, name: 'content' }) ?? ''

  const updateArticleMutation = useMutation({
    mutationFn: (values: ArticleFormValues) =>
      updateArticle(article.id, {
        title: values.title.trim(),
        content: values.content.trim(),
      }),
    onSuccess: async (updatedArticle) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['articles'] }),
        queryClient.invalidateQueries({ queryKey: ['article', article.id] }),
      ])
      onUpdated?.(updatedArticle)
    },
  })

  function handleSubmit(values: ArticleFormValues) {
    updateArticleMutation.mutate(values)
  }

  return (
    <form className="space-y-4 rounded-md border border-border bg-secondary/35 p-4" onSubmit={form.handleSubmit(handleSubmit)}>
      <div>
        <p className="font-medium text-foreground">Edytuj artykuł</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Zapisane zmiany będą od razu widoczne w części publicznej.
        </p>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">Tytuł</span>
        <Input maxLength={ARTICLE_TITLE_MAX_LENGTH} {...form.register('title')} />
        <div className="flex items-center justify-between gap-3">
          <FormFieldError message={form.formState.errors.title?.message} />
          <p className="ml-auto text-xs text-muted-foreground">
            {title.length}/{ARTICLE_TITLE_MAX_LENGTH}
          </p>
        </div>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">Treść</span>
        <Textarea className="min-h-80" maxLength={ARTICLE_CONTENT_MAX_LENGTH} {...form.register('content')} />
        <div className="flex items-center justify-between gap-3">
          <FormFieldError message={form.formState.errors.content?.message} />
          <p className="ml-auto text-xs text-muted-foreground">
            {content.length}/{ARTICLE_CONTENT_MAX_LENGTH}
          </p>
        </div>
      </label>

      {updateArticleMutation.isError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {getErrorMessage(updateArticleMutation.error)}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button disabled={updateArticleMutation.isPending} onClick={onCancel} type="button" variant="outline">
          <X className="size-4" aria-hidden="true" />
          Anuluj
        </Button>
        <Button disabled={updateArticleMutation.isPending} type="submit">
          <Save className="size-4" aria-hidden="true" />
          {updateArticleMutation.isPending ? 'Zapisywanie' : 'Zapisz zmiany'}
        </Button>
      </div>
    </form>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się zaktualizować artykułu.'
}
