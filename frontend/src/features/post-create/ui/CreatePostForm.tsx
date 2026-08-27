import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FilePenLine, Send } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { HashtagAutocompleteInput } from '@/entities/hashtag/ui/HashtagAutocompleteInput'
import { createPost, createPostDraft, uploadPostContentImage } from '@/entities/post/api/postApi'
import {
  POST_CONTENT_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  postDraftFormSchema,
  postFormSchema,
} from '@/entities/post/model/postForm'
import type { PostFormValues } from '@/entities/post/model/postForm'
import { parsePostHashtags } from '@/entities/post/model/parsePostHashtags'
import type { Post } from '@/entities/post/model/types'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { RichTextEditor } from '@/shared/ui/rich-text-editor'
import { UnsavedChangesGuard } from '@/shared/ui/unsaved-changes-guard'

type CreatePostFormProps = {
  onCreated?: (post: Post) => void
}

export function CreatePostForm({ onCreated }: CreatePostFormProps) {
  const queryClient = useQueryClient()
  const form = useForm<PostFormValues>({
    defaultValues: {
      title: '',
      content: '',
      hashtags: '',
    },
  })
  const title = useWatch({ control: form.control, name: 'title' }) ?? ''
  const content = useWatch({ control: form.control, name: 'content' }) ?? ''
  const hashtagsValue = useWatch({ control: form.control, name: 'hashtags' }) ?? ''
  const parsedHashtags = parsePostHashtags(hashtagsValue)

  const createPostMutation = useMutation({ mutationFn: createPost })
  const draftMutation = useMutation({ mutationFn: createPostDraft })
  const isPending = createPostMutation.isPending || draftMutation.isPending
  const mutationError = createPostMutation.error ?? draftMutation.error

  async function persistDraft(notifyParent: boolean) {
    const values = form.getValues()
    if (!validateValues(values, false)) {
      if (notifyParent) {
        return
      }
      throw new Error('Popraw pola oznaczone w formularzu.')
    }

    const post = await draftMutation.mutateAsync(toRequest(values))
    form.reset({ title: '', content: '', hashtags: '' })
    await invalidatePostQueries(queryClient)
    if (notifyParent) {
      window.setTimeout(() => onCreated?.(post), 0)
    }
  }

  async function handleSubmitForModeration() {
    const values = form.getValues()
    if (!validateValues(values, true)) {
      return
    }

    const post = await createPostMutation.mutateAsync(toRequest(values))
    form.reset({ title: '', content: '', hashtags: '' })
    await invalidatePostQueries(queryClient)
    window.setTimeout(() => onCreated?.(post), 0)
  }

  function validateValues(values: PostFormValues, forSubmission: boolean) {
    form.clearErrors()
    const result = (forSubmission ? postFormSchema : postDraftFormSchema).safeParse(values)
    if (result.success) {
      return true
    }

    result.error.issues.forEach((issue) => {
      const field = issue.path[0]
      if (field === 'title' || field === 'content' || field === 'hashtags') {
        form.setError(field, { message: issue.message })
      }
    })
    return false
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Nowy post</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Tytuł</span>
              <Input
                disabled={isPending}
                maxLength={POST_TITLE_MAX_LENGTH}
                placeholder="Np. pierwszy miesiąc z Seiko Alpinist"
                {...form.register('title')}
              />
              <div className="flex items-center justify-between gap-3">
                <FormFieldError message={form.formState.errors.title?.message} />
                <p className="ml-auto text-xs text-muted-foreground">
                  {title.length}/{POST_TITLE_MAX_LENGTH}
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
                    ariaLabel="Treść posta"
                    disabled={isPending}
                    invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    placeholder="Opisz obserwacje, pytanie albo historię związaną z zegarkiem."
                    uploadImage={uploadPostContentImage}
                    value={field.value}
                  />
                )}
              />
              <div className="flex items-center justify-between gap-3">
                <FormFieldError message={form.formState.errors.content?.message} />
                <p className="ml-auto text-xs text-muted-foreground">
                  {content.length}/{POST_CONTENT_MAX_LENGTH}
                </p>
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Hashtagi</span>
              <Controller
                control={form.control}
                name="hashtags"
                render={({ field }) => (
                  <HashtagAutocompleteInput
                    disabled={isPending}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={field.value}
                  />
                )}
              />
              <FormFieldError message={form.formState.errors.hashtags?.message} />
            </label>

            {parsedHashtags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {parsedHashtags.map((hashtag) => (
                  <Badge key={hashtag} variant="secondary">
                    {hashtag}
                  </Badge>
                ))}
              </div>
            ) : null}

            {mutationError ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {getErrorMessage(mutationError)}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button disabled={isPending} onClick={() => void persistDraft(true).catch(() => undefined)} type="button" variant="outline">
                <FilePenLine className="size-4" aria-hidden="true" />
                {draftMutation.isPending ? 'Zapisywanie...' : 'Zapisz szkic'}
              </Button>
              <Button disabled={isPending} onClick={() => void handleSubmitForModeration().catch(() => undefined)} type="button">
                <Send className="size-4" aria-hidden="true" />
                {createPostMutation.isPending ? 'Wysyłanie...' : 'Wyślij do moderacji'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <UnsavedChangesGuard itemName="Post" onSave={() => persistDraft(false)} saveLabel="Zapisz szkic" when={form.formState.isDirty} />
    </>
  )
}

function toRequest(values: PostFormValues) {
  return {
    title: values.title.trim(),
    content: values.content.trim(),
    hashtags: parsePostHashtags(values.hashtags),
  }
}

async function invalidatePostQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['posts'] }),
    queryClient.invalidateQueries({ queryKey: ['my-posts'] }),
  ])
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się dodać posta.'
}
