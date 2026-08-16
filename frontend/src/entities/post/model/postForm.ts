import { z } from 'zod'

import { parsePostHashtags } from '@/entities/post/model/parsePostHashtags'

export const POST_TITLE_MAX_LENGTH = 200
export const POST_CONTENT_MAX_LENGTH = 10000
export const POST_HASHTAGS_MAX_COUNT = 10
export const POST_HASHTAG_MAX_LENGTH = 100

export const postFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Wpisz tytuł posta.')
      .max(POST_TITLE_MAX_LENGTH, `Tytuł może mieć maksymalnie ${POST_TITLE_MAX_LENGTH} znaków.`),
    content: z
      .string()
      .trim()
      .min(1, 'Wpisz treść posta.')
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

export type PostFormValues = z.infer<typeof postFormSchema>

export function formatPostHashtagsInput(hashtags: string[]) {
  return hashtags.join(', ')
}
