import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { createPost } from '@/entities/post/api/postApi'
import type { Post } from '@/entities/post/model/types'
import { parsePostHashtags } from '@/features/post-create/model/parsePostHashtags'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

const createPostSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Wpisz tytuł posta.')
      .max(200, 'Tytuł może mieć maksymalnie 200 znaków.'),
    content: z
      .string()
      .trim()
      .min(1, 'Wpisz treść posta.')
      .max(10000, 'Post może mieć maksymalnie 10000 znaków.'),
    hashtags: z.string(),
  })
  .superRefine((values, context) => {
    const hashtags = parsePostHashtags(values.hashtags)

    if (hashtags.length > 10) {
      context.addIssue({
        code: 'custom',
        message: 'Możesz dodać maksymalnie 10 hashtagów.',
        path: ['hashtags'],
      })
    }

    if (hashtags.some((hashtag) => hashtag.length > 100)) {
      context.addIssue({
        code: 'custom',
        message: 'Pojedynczy hashtag może mieć maksymalnie 100 znaków.',
        path: ['hashtags'],
      })
    }
  })

type CreatePostFormValues = z.infer<typeof createPostSchema>

type CreatePostFormProps = {
  onCreated?: (post: Post) => void
}

export function CreatePostForm({ onCreated }: CreatePostFormProps) {
  const queryClient = useQueryClient()
  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
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

  const createPostMutation = useMutation({
    mutationFn: (values: CreatePostFormValues) =>
      createPost({
        title: values.title.trim(),
        content: values.content.trim(),
        hashtags: parsePostHashtags(values.hashtags),
      }),
    onSuccess: async (createdPost) => {
      form.reset({
        title: '',
        content: '',
        hashtags: '',
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['my-posts'] }),
      ])
      onCreated?.(createdPost)
    },
  })

  function handleSubmit(values: CreatePostFormValues) {
    createPostMutation.mutate(values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nowy post</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Tytuł</span>
            <Input
              maxLength={200}
              placeholder="Np. pierwszy miesiąc z Seiko Alpinist"
              {...form.register('title')}
            />
            <div className="flex items-center justify-between gap-3">
              <FormFieldError message={form.formState.errors.title?.message} />
              <p className="ml-auto text-xs text-muted-foreground">{title.length}/200</p>
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Treść</span>
            <Textarea
              className="min-h-72"
              maxLength={10000}
              placeholder="Opisz obserwacje, pytanie albo historię związaną z zegarkiem."
              {...form.register('content')}
            />
            <div className="flex items-center justify-between gap-3">
              <FormFieldError message={form.formState.errors.content?.message} />
              <p className="ml-auto text-xs text-muted-foreground">{content.length}/10000</p>
            </div>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Hashtagi</span>
            <Input
              placeholder="seiko, diver, quartz"
              {...form.register('hashtags')}
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

          {createPostMutation.isError ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {getErrorMessage(createPostMutation.error)}
            </p>
          ) : null}

          <Button className="w-full" disabled={createPostMutation.isPending} type="submit">
            <Send className="size-4" aria-hidden="true" />
            {createPostMutation.isPending ? 'Zapisywanie' : 'Wyślij do moderacji'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się dodać posta.'
}
