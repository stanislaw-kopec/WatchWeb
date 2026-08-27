import { z } from 'zod'

import { hasMeaningfulArticleContent } from '@/entities/article/model/articleContent'

export const ARTICLE_TITLE_MAX_LENGTH = 200
export const ARTICLE_CONTENT_MAX_LENGTH = 30000

export const articleDraftFormSchema = z.object({
  title: z
    .string()
    .trim()
    .max(ARTICLE_TITLE_MAX_LENGTH, `Tytuł może mieć maksymalnie ${ARTICLE_TITLE_MAX_LENGTH} znaków.`),
  content: z
    .string()
    .trim()
    .max(ARTICLE_CONTENT_MAX_LENGTH, `Treść może mieć maksymalnie ${ARTICLE_CONTENT_MAX_LENGTH} znaków.`),
})

export const articleFormSchema = articleDraftFormSchema.superRefine((values, context) => {
  if (!values.title) {
    context.addIssue({ code: 'custom', message: 'Tytuł jest wymagany.', path: ['title'] })
  }

  if (!hasMeaningfulArticleContent(values.content)) {
    context.addIssue({ code: 'custom', message: 'Treść jest wymagana.', path: ['content'] })
  }
})

export type ArticleFormValues = z.infer<typeof articleFormSchema>
