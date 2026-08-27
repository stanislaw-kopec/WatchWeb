import { z } from 'zod'

import { formatHashtagInput } from '@/entities/hashtag/model/hashtagInput'
import { hasMeaningfulPostContent } from '@/entities/post/model/postContent'
import { parsePostHashtags } from '@/entities/post/model/parsePostHashtags'

export const POST_TITLE_MAX_LENGTH = 200
export const POST_CONTENT_MAX_LENGTH = 10000
export const POST_HASHTAGS_MAX_COUNT = 10
export const POST_HASHTAG_MAX_LENGTH = 100

export const postDraftFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .max(POST_TITLE_MAX_LENGTH, `Tytuł może mieć maksymalnie ${POST_TITLE_MAX_LENGTH} znaków.`),
    content: z
      .string()
      .trim()
      .max(POST_CONTENT_MAX_LENGTH, `Post może mieć maksymalnie ${POST_CONTENT_MAX_LENGTH} znaków.`),
    hashtags: z.string(),
  })
  .superRefine((values, context) => {
    const hashtags = parsePostHashtags(values.hashtags)

    if (hashtags.length > POST_HASHTAGS_MAX_COUNT) {
      context.addIssue({
        code: 'custom',
        message: `Możesz dodać maksymalnie ${POST_HASHTAGS_MAX_COUNT} hashtagów.`,
        path: ['hashtags'],
      })
    }

    if (hashtags.some((hashtag) => hashtag.length > POST_HASHTAG_MAX_LENGTH)) {
      context.addIssue({
        code: 'custom',
        message: `Pojedynczy hashtag może mieć maksymalnie ${POST_HASHTAG_MAX_LENGTH} znaków.`,
        path: ['hashtags'],
      })
    }
  })

export const postFormSchema = postDraftFormSchema.superRefine((values, context) => {
  if (!values.title.trim()) {
    context.addIssue({ code: 'custom', message: 'Wpisz tytuł posta.', path: ['title'] })
  }

  if (!hasMeaningfulPostContent(values.content)) {
    context.addIssue({ code: 'custom', message: 'Wpisz treść posta.', path: ['content'] })
  }
})

export type PostFormValues = z.infer<typeof postFormSchema>

export function formatPostHashtagsInput(hashtags: string[]) {
  return formatHashtagInput(hashtags)
}
