import {
  hasMeaningfulRichContent,
  normalizeRichContentForEditor,
  richContentToText,
  sanitizeRichContent,
} from '@/shared/lib/richContent'

export const normalizeArticleContentForEditor = normalizeRichContentForEditor
export const sanitizeArticleContent = sanitizeRichContent
export const articleContentToText = richContentToText
export const hasMeaningfulArticleContent = hasMeaningfulRichContent
