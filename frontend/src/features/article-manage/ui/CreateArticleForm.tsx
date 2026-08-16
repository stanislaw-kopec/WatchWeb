import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'

import { createArticle } from '@/entities/article/api/articleApi'
import type { Article } from '@/entities/article/model/types'
import { ARTICLE_CONTENT_MAX_LENGTH, ARTICLE_TITLE_MAX_LENGTH, articleFormSchema } from '@/features/article-manage/model/articleForm'
import type { ArticleFormValues } from '@/features/article-manage/model/articleForm'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

type CreateArticleFormProps = {
  onCreated?: (article: Article) => void
}

export function CreateArticleForm({ onCreated }: CreateArticleFormProps) {
  const queryClient = useQueryClient()
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  })
  const title = useWatch({ control: form.control, name: 'title' }) ?? ''
  const content = useWatch({ control: form.control, name: 'content' }) ?? ''

  const createArticleMutation = useMutation({
    mutationFn: (values: ArticleFormValues) =>
      createArticle({
        title: values.title.trim(),
        content: values.content.trim(),
      }),
    onSuccess: async (article) => {
      await queryClient.invalidateQueries({ queryKey: ['articles'] })
      onCreated?.(article)
    },
  })

  function handleSubmit(values: ArticleFormValues) {
    createArticleMutation.mutate(values)
  }

  return (
    <Card>
      <CardContent className="p-5 md:p-6">
        <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
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
            <Textarea className="min-h-96" maxLength={ARTICLE_CONTENT_MAX_LENGTH} {...form.register('content')} />
            <div className="flex items-center justify-between gap-3">
              <FormFieldError message={form.formState.errors.content?.message} />
              <p className="ml-auto text-xs text-muted-foreground">
                {content.length}/{ARTICLE_CONTENT_MAX_LENGTH}
              </p>
            </div>
          </label>

          {createArticleMutation.isError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {getErrorMessage(createArticleMutation.error)}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button disabled={createArticleMutation.isPending} type="submit">
              <Save className="size-4" aria-hidden="true" />
              {createArticleMutation.isPending ? 'Publikowanie' : 'Opublikuj artykuł'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się opublikować artykułu.'
}
