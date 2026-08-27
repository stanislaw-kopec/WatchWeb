import { Newspaper } from 'lucide-react'

import type { Article } from '@/entities/article/model/types'

type ArticleHeroVisualProps = {
  article: Article
  variant?: 'card' | 'hero'
}

export function ArticleHeroVisual({ article, variant = 'card' }: ArticleHeroVisualProps) {
  if (article.headerImageUrl) {
    return (
      <img
        alt=""
        className={variant === 'hero'
          ? 'h-full min-h-72 w-full bg-secondary/45 object-contain'
          : 'h-56 w-full bg-secondary/45 object-contain lg:h-full'}
        loading="lazy"
        src={article.headerImageUrl}
      />
    )
  }

  return (
    <div className="flex h-full min-h-56 flex-col justify-between bg-secondary p-5 text-secondary-foreground">
      <div className="flex size-12 items-center justify-center rounded-md bg-card text-primary shadow-sm">
        <Newspaper className="size-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">WatchWeb Journal</p>
        <p className={variant === 'hero' ? 'mt-3 max-w-xl text-2xl font-semibold tracking-normal' : 'mt-2 line-clamp-2 text-lg font-semibold tracking-normal'}>
          {article.title}
        </p>
      </div>
    </div>
  )
}
