import {
  hasMeaningfulRichContent,
  normalizeRichContentForEditor,
  richContentToText,
  sanitizeRichContent,
} from '@/shared/lib/richContent'

export const normalizePostContentForEditor = normalizeRichContentForEditor
export const sanitizePostContent = sanitizeRichContent
export const postContentToText = richContentToText
export const hasMeaningfulPostContent = hasMeaningfulRichContent
