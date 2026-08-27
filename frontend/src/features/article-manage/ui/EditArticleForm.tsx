import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FilePenLine, Save, Send, X } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { publishArticle, updateArticle, updateArticleDraft, uploadArticleContentImage } from '@/entities/article/api/articleApi'
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
import { Input } from '@/shared/ui/input'

type EditArticleFormProps = {
  article: Article
  onCancel: () => void
  onUpdated?: (article: Article) => void
  onPublished?: (article: Article) => void
}

export function EditArticleForm({ article, onCancel, onUpdated, onPublished }: EditArticleFormProps) {
  const queryClient = useQueryClient()
  const form = useForm<ArticleFormValues>({
    defaultValues: {
      title: article.title,
      content: article.content,
    },
  })
  const title = useWatch({ control: form.control, name: 'title' }) ?? ''
  const content = useWatch({ control: form.control, name: 'content' }) ?? ''

  const updateMutation = useMutation({ mutationFn: (values: ArticleFormValues) => updateArticle(article.id, toRequest(values)) })
  const draftMutation = useMutation({ mutationFn: (values: ArticleFormValues) => updateArticleDraft(article.id, toRequest(values)) })
  const publishMutation = useMutation({ mutationFn: (values: ArticleFormValues) => publishArticle(article.id, toRequest(values)) })
  const isPending = updateMutation.isPending || draftMutation.isPending || publishMutation.isPending
  const mutationError = updateMutation.error ?? draftMutation.error ?? publishMutation.error

  async function persistChanges(notifyParent: boolean) {
    const values = form.getValues()
    if (!validateValues(values, article.status === 'PUBLISHED')) {
      if (notifyParent) {
        return
      }
      throw new Error('Popraw pola oznaczone w formularzu.')
    }

    const updatedArticle = article.status === 'DRAFT'
      ? await draftMutation.mutateAsync(values)
      : await updateMutation.mutateAsync(values)
    form.reset({ title: updatedArticle.title, content: updatedArticle.content })
    await invalidateArticleQueries(queryClient, article.id)
    if (notifyParent) {
      onUpdated?.(updatedArticle)
    }
  }

  async function handlePublish() {
    const values = form.getValues()
    if (!validateValues(values, true)) {
      return
    }

    const publishedArticle = await publishMutation.mutateAsync(values)
    form.reset({ title: publishedArticle.title, content: publishedArticle.content })
    await invalidateArticleQueries(queryClient, article.id)
    window.setTimeout(() => (onPublished ?? onUpdated)?.(publishedArticle), 0)
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
      <form className="space-y-5 rounded-lg border border-border bg-card p-5 shadow-sm md:p-6" onSubmit={(event) => event.preventDefault()}>
        <div>
          <p className="font-medium text-foreground">Edytuj artykuł</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {article.status === 'DRAFT'
              ? 'Szkic pozostaje prywatny do chwili użycia przycisku publikacji.'
              : 'Zapisane zmiany będą od razu widoczne w części publicznej.'}
          </p>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Tytuł</span>
          <Input disabled={isPending} maxLength={ARTICLE_TITLE_MAX_LENGTH} {...form.register('title')} />
          <div className="flex items-center justify-between gap-3">
            <FormFieldError message={form.formState.errors.title?.message} />
            <p className="ml-auto text-xs text-muted-foreground">{title.length}/{ARTICLE_TITLE_MAX_LENGTH}</p>
          </div>
        </label>

        <div className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Treść</span>
          <Controller
            control={form.control}
            name="content"
            render={({ field, fieldState }) => (
              <RichTextEditor
                ariaLabel="Treść artykułu"
                disabled={isPending}
                invalid={fieldState.invalid}
                onBlur={field.onBlur}
                onChange={field.onChange}
                placeholder="Zacznij pisać artykuł..."
                uploadImage={uploadArticleContentImage}
                value={field.value}
              />
            )}
          />
          <div className="flex items-center justify-between gap-3">
            <FormFieldError message={form.formState.errors.content?.message} />
            <p className="ml-auto text-xs text-muted-foreground">{content.length}/{ARTICLE_CONTENT_MAX_LENGTH}</p>
          </div>
        </div>

        {mutationError ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {getErrorMessage(mutationError)}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={isPending} onClick={onCancel} type="button" variant="outline">
            <X className="size-4" aria-hidden="true" />
            Zamknij
          </Button>
          <Button disabled={isPending} onClick={() => void persistChanges(true).catch(() => undefined)} type="button" variant={article.status === 'DRAFT' ? 'outline' : 'default'}>
            {article.status === 'DRAFT' ? <FilePenLine className="size-4" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
            {draftMutation.isPending || updateMutation.isPending ? 'Zapisywanie…' : article.status === 'DRAFT' ? 'Zapisz wersję roboczą' : 'Zapisz zmiany'}
          </Button>
          {article.status === 'DRAFT' ? (
            <Button disabled={isPending} onClick={() => void handlePublish().catch(() => undefined)} type="button">
              <Send className="size-4" aria-hidden="true" />
              {publishMutation.isPending ? 'Publikowanie…' : 'Opublikuj artykuł'}
            </Button>
          ) : null}
        </div>
      </form>

      <UnsavedArticleChangesGuard
        onSave={() => persistChanges(false)}
        saveLabel={article.status === 'DRAFT' ? 'Zapisz wersję roboczą' : 'Zapisz zmiany'}
        when={form.formState.isDirty}
      />
    </>
  )
}

function toRequest(values: ArticleFormValues) {
  return {
    title: values.title.trim(),
    content: values.content.trim(),
  }
}

async function invalidateArticleQueries(queryClient: ReturnType<typeof useQueryClient>, articleId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['articles'] }),
    queryClient.invalidateQueries({ queryKey: ['article', articleId] }),
    queryClient.invalidateQueries({ queryKey: ['my-article', articleId] }),
    queryClient.invalidateQueries({ queryKey: ['my-articles'] }),
  ])
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się zaktualizować artykułu.'
}
