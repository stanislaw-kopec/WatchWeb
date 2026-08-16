import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LogIn, Send } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'

import { createPostComment } from '@/entities/comment/api/commentApi'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Textarea } from '@/shared/ui/textarea'

const createPostCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Wpisz treść komentarza.')
    .max(2000, 'Komentarz może mieć maksymalnie 2000 znaków.'),
})

type CreatePostCommentFormValues = z.infer<typeof createPostCommentSchema>

type CreatePostCommentFormProps = {
  postId: string
  parentId?: string | null
  parentAuthorUsername?: string
  variant?: 'card' | 'inline'
  submitLabel?: string
  placeholder?: string
  onCancel?: () => void
  onSuccess?: () => void
}

export function CreatePostCommentForm({
  postId,
  parentId = null,
  parentAuthorUsername,
  variant = 'card',
  submitLabel = parentId ? 'Dodaj odpowiedź' : 'Dodaj komentarz',
  placeholder = parentId
    ? 'Napisz odpowiedź w tym wątku.'
    : 'Dołącz do dyskusji pod tym postem.',
  onCancel,
  onSuccess,
}: CreatePostCommentFormProps) {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthSession()
  const form = useForm<CreatePostCommentFormValues>({
    resolver: zodResolver(createPostCommentSchema),
    defaultValues: {
      content: '',
    },
  })
  const content = useWatch({ control: form.control, name: 'content' }) ?? ''

  const createCommentMutation = useMutation({
    mutationFn: (values: CreatePostCommentFormValues) =>
      createPostComment(postId, {
        parentId,
        content: values.content.trim(),
      }),
    onSuccess: async () => {
      form.reset({ content: '' })
      await queryClient.invalidateQueries({ queryKey: ['post-comments', postId] })
      onSuccess?.()
    },
  })

  if (!isAuthenticated) {
    return renderUnauthenticatedState(postId, variant)
  }

  function handleSubmit(values: CreatePostCommentFormValues) {
    createCommentMutation.mutate(values)
  }

  const formContent = (
    <form className="space-y-3" onSubmit={form.handleSubmit(handleSubmit)}>
      {parentAuthorUsername ? (
        <p className="text-xs font-medium text-muted-foreground">
          Odpowiedź dla {parentAuthorUsername}
        </p>
      ) : null}

      <label className="grid gap-2">
        <span className="text-sm font-medium text-foreground">Treść komentarza</span>
        <Textarea
          className={variant === 'inline' ? 'min-h-24' : undefined}
          maxLength={2000}
          placeholder={placeholder}
          {...form.register('content')}
        />
        <div className="flex items-center justify-between gap-3">
          <FormFieldError message={form.formState.errors.content?.message} />
          <p className="ml-auto text-xs text-muted-foreground">{content.length}/2000</p>
        </div>
      </label>

      {createCommentMutation.isSuccess && variant === 'card' ? (
        <p className="rounded-md border border-primary/30 bg-secondary p-3 text-sm text-secondary-foreground">
          Komentarz został dodany.
        </p>
      ) : null}

      {createCommentMutation.isError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {getErrorMessage(createCommentMutation.error)}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            disabled={createCommentMutation.isPending}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            Anuluj
          </Button>
        ) : null}
        <Button disabled={createCommentMutation.isPending} type="submit">
          <Send className="size-4" aria-hidden="true" />
          {createCommentMutation.isPending ? 'Zapisywanie' : submitLabel}
        </Button>
      </div>
    </form>
  )

  if (variant === 'inline') {
    return (
      <div className="rounded-md border border-border bg-secondary/40 p-3">
        {formContent}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dodaj komentarz</CardTitle>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  )
}

function renderUnauthenticatedState(postId: string, variant: 'card' | 'inline') {
  const content = (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Komentarze mogą dodawać tylko zalogowani użytkownicy.
      </p>
      <Button asChild>
        <Link to={`/login?redirectTo=${encodeURIComponent(`/posts/${postId}`)}`}>
          <LogIn className="size-4" aria-hidden="true" />
          Zaloguj się
        </Link>
      </Button>
    </div>
  )

  if (variant === 'inline') {
    return (
      <div className="rounded-md border border-border bg-secondary/40 p-3">
        {content}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dodaj komentarz</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes('Maximum comment depth')) {
    return 'Nie można dodać kolejnej odpowiedzi w tym wątku.'
  }

  return error instanceof Error ? error.message : 'Nie udało się dodać komentarza.'
}
