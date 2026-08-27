import { articleContentToText } from '@/entities/article/model/articleContent'

export function estimateReadingTime(content: string) {
  const words = countWords(content)
  const minutes = Math.max(1, Math.ceil(words / 220))

  return `${minutes} min czytania`
}

export function countWords(content: string) {
  return articleContentToText(content).split(/\s+/).filter(Boolean).length
}
