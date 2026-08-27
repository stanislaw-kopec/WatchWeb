import type { ArticleStatus } from '@/entities/article/model/types'

export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  DRAFT: 'Wersja robocza',
  PUBLISHED: 'Opublikowany',
}

export const ARTICLE_STATUS_DESCRIPTIONS: Record<ArticleStatus, string> = {
  DRAFT: 'Materiał jest prywatny i nie został jeszcze opublikowany.',
  PUBLISHED: 'Materiał jest dostępny publicznie.',
}
