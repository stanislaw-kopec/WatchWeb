import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, X } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { HashtagAutocompleteInput } from '@/entities/hashtag/ui/HashtagAutocompleteInput'
import { updatePost } from '@/entities/post/api/postApi'
import {
  formatPostHashtagsInput,
  POST_CONTENT_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  postFormSchema,
} from '@/entities/post/model/postForm'
import type { PostFormValues } from '@/entities/post/model/postForm'
import { parsePostHashtags } from '@/entities/post/model/parsePostHashtags'
import type { Post } from '@/entities/post/model/types'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

type EditPostFormProps = {
  post: Post
  onCancel: () => void
  onUpdated?: (post: Post) => void
}

export function EditPostForm({ post, onCancel, onUpdated }: EditPostFormProps) {
  const queryClient = useQueryClient()
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: post.title,
      content: post.content,
      hashtags: formatPostHashtagsInput(post.hashtags),
    },
  })
  const title = useWatch({ control: form.control, name: 'title' }) ?? ''
  const content = useWatch({ control: form.control, name: 'content' }) ?? ''
  const hashtagsValue = useWatch({ control: form.control, name: 'hashtags' }) ?? ''
  const parsedHashtags = parsePostHashtags(hashtagsValue)

  const updatePostMutation = useMutation({
    mutationFn: (values: PostFormValues) =>
      updatePost(post.id, {
        title: values.title.trim(),
        content: values.content.trim(),
        hashtags: parsePostHashtags(values.hashtags),
      }),
    onSuccess: async (updatedPost) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['post', post.id] }),
        queryClient.invalidateQueries({ queryKey: ['my-posts'] }),
      ])
      onUpdated?.(updatedPost)
    },
  })

  function handleSubmit(values: PostFormValues) {
    updatePostMutation.mutate(values)
  }

  return (
    <form className="space-y-4 rounded-md border border-border bg-secondary/35 p-4" onSubmit={form.handleSubmit(handleSubmit)}>
      <div>
        <p className="font-medium text-foreground">Edytuj post</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Po zapisaniu wpis wróci do moderacji.
        </p>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">Tytuł</span>
        <Input maxLength={POST_TITLE_MAX_LENGTH} {...form.register('title')} />
        <div className="flex items-center justify-between gap-3">
          <FormFieldError message={form.formState.errors.title?.message} />
          <p className="ml-auto text-xs text-muted-foreground">
            {title.length}/{POST_TITLE_MAX_LENGTH}
          </p>
        </div>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">Treść</span>
        <Textarea className="min-h-48" maxLength={POST_CONTENT_MAX_LENGTH} {...form.register('content')} />
        <div className="flex items-center justify-between gap-3">
          <FormFieldError message={form.formState.errors.content?.message} />
          <p className="ml-auto text-xs text-muted-foreground">
            {content.length}/{POST_CONTENT_MAX_LENGTH}
          </p>
        </div>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">Hashtagi</span>
        <Controller
          control={form.control}
          name="hashtags"
          render={({ field }) => (
            <HashtagAutocompleteInput
              disabled={updatePostMutation.isPending}
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

      {updatePostMutation.isError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {getErrorMessage(updatePostMutation.error)}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button disabled={updatePostMutation.isPending} onClick={onCancel} type="button" variant="outline">
          <X className="size-4" aria-hidden="true" />
          Anuluj
        </Button>
        <Button disabled={updatePostMutation.isPending} type="submit">
          <Save className="size-4" aria-hidden="true" />
          {updatePostMutation.isPending ? 'Zapisywanie' : 'Zapisz zmiany'}
        </Button>
      </div>
    </form>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się zaktualizować posta.'
}
