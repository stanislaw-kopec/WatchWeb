import { z } from 'zod'

export const ARTICLE_TITLE_MAX_LENGTH = 200
export const ARTICLE_CONTENT_MAX_LENGTH = 30000

export const articleFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tytuł jest wymagany.')
    .max(ARTICLE_TITLE_MAX_LENGTH, `Tytuł może mieć maksymalnie ${ARTICLE_TITLE_MAX_LENGTH} znaków.`),
  content: z
    .string()
    .trim()
    .min(1, 'Treść jest wymagana.')
    .max(ARTICLE_CONTENT_MAX_LENGTH, `Treść może mieć maksymalnie ${ARTICLE_CONTENT_MAX_LENGTH} znaków.`),
})

export type ArticleFormValues = z.infer<typeof articleFormSchema>
