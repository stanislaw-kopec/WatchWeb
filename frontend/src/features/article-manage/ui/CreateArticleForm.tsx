import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FilePenLine, Send } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { createArticle, createArticleDraft } from '@/entities/article/api/articleApi'
import type { Article } from '@/entities/article/model/types'
import {
  ARTICLE_CONTENT_MAX_LENGTH,
  ARTICLE_TITLE_MAX_LENGTH,
  articleDraftFormSchema,
  articleFormSchema,
} from '@/features/article-manage/model/articleForm'
import type { ArticleFormValues } from '@/features/article-manage/model/articleForm'
import { RichTextEditor } from '@/features/article-manage/ui/RichTextEditor'
import { UnsavedArticleChangesGuard } from '@/features/article-manage/ui/UnsavedArticleChangesGuard'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

type CreateArticleFormProps = {
  onPublished?: (article: Article) => void
  onDraftSaved?: (article: Article) => void
}

export function CreateArticleForm({ onPublished, onDraftSaved }: CreateArticleFormProps) {
  const queryClient = useQueryClient()
  const form = useForm<ArticleFormValues>({
    defaultValues: {
      title: '',
      content: '',
    },
  })
  const title = useWatch({ control: form.control, name: 'title' }) ?? ''
  const content = useWatch({ control: form.control, name: 'content' }) ?? ''

  const publishMutation = useMutation({ mutationFn: createArticle })
  const draftMutation = useMutation({ mutationFn: createArticleDraft })
  const isPending = publishMutation.isPending || draftMutation.isPending
  const mutationError = publishMutation.error ?? draftMutation.error

  async function persistDraft(notifyParent: boolean) {
    const values = form.getValues()
    if (!validateValues(values, false)) {
      if (notifyParent) {
        return
      }
      throw new Error('Popraw pola oznaczone w formularzu.')
    }

    const article = await draftMutation.mutateAsync(toRequest(values))
    form.reset({ title: article.title, content: article.content })
    await invalidateArticleQueries(queryClient)
    if (notifyParent) {
      window.setTimeout(() => onDraftSaved?.(article), 0)
    }
  }

  async function handlePublish() {
    const values = form.getValues()
    if (!validateValues(values, true)) {
      return
    }

    const article = await publishMutation.mutateAsync(toRequest(values))
    form.reset({ title: article.title, content: article.content })
    await invalidateArticleQueries(queryClient)
    window.setTimeout(() => onPublished?.(article), 0)
  }

  function validateValues(values: ArticleFormValues, forPublication: boolean) {
    form.clearErrors()
    const result = (forPublication ? articleFormSchema : articleDraftFormSchema).safeParse(values)
    if (result.success) {
      return true
    }

    result.error.issues.forEach((issue) => {
      const field = issue.path[0]
      if (field === 'title' || field === 'content') {
        form.setError(field, { message: issue.message })
      }
    })
    return false
  }

  return (
    <>
      <Card>
        <CardContent className="p-5 md:p-6">
          <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Tytuł</span>
              <Input disabled={isPending} maxLength={ARTICLE_TITLE_MAX_LENGTH} {...form.register('title')} />
              <div className="flex items-center justify-between gap-3">
                <FormFieldError message={form.formState.errors.title?.message} />
                <p className="ml-auto text-xs text-muted-foreground">
                  {title.length}/{ARTICLE_TITLE_MAX_LENGTH}
                </p>
              </div>
            </label>

            <div className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Treść</span>
              <Controller
                control={form.control}
                name="content"
                render={({ field, fieldState }) => (
                  <RichTextEditor
                    disabled={isPending}
                    invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={field.value}
                  />
                )}
              />
              <div className="flex items-center justify-between gap-3">
                <FormFieldError message={form.formState.errors.content?.message} />
                <p className="ml-auto text-xs text-muted-foreground">
                  {content.length}/{ARTICLE_CONTENT_MAX_LENGTH}
                </p>
              </div>
            </div>

            {mutationError ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {getErrorMessage(mutationError)}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button disabled={isPending} onClick={() => void persistDraft(true).catch(() => undefined)} type="button" variant="outline">
                <FilePenLine className="size-4" aria-hidden="true" />
                {draftMutation.isPending ? 'Zapisywanie…' : 'Zapisz wersję roboczą'}
              </Button>
              <Button disabled={isPending} onClick={() => void handlePublish().catch(() => undefined)} type="button">
                <Send className="size-4" aria-hidden="true" />
                {publishMutation.isPending ? 'Publikowanie…' : 'Opublikuj artykuł'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <UnsavedArticleChangesGuard onSave={() => persistDraft(false)} when={form.formState.isDirty} />
    </>
  )
}

function toRequest(values: ArticleFormValues) {
  return {
    title: values.title.trim(),
    content: values.content.trim(),
  }
}

async function invalidateArticleQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['articles'] }),
    queryClient.invalidateQueries({ queryKey: ['my-articles'] }),
  ])
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się zapisać artykułu.'
}
