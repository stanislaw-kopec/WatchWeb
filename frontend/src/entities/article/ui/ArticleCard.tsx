import { ArrowRight, CalendarDays, Newspaper, UserRound } from 'lucide-react'

import type { Article } from '@/entities/article/model/types'
import { formatDateTime } from '@/shared/lib/date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

type ArticleCardProps = {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <ArticleVisual article={article} />

        <CardContent className="flex min-w-0 flex-col gap-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Artykuł</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {formatDateTime(article.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <UserRound className="size-3.5" aria-hidden="true" />
              {article.authorUsername}
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="line-clamp-2 text-xl font-semibold tracking-normal text-foreground">
              {article.title}
            </h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {article.content}
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{estimateReadingTime(article.content)}</p>
            <Button disabled type="button" variant="outline">
              Szczegóły wkrótce
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

function ArticleVisual({ article }: ArticleCardProps) {
  if (article.headerImageUrl) {
    return (
      <img
        alt=""
        className="h-56 w-full object-cover lg:h-full"
        loading="lazy"
        src={article.headerImageUrl}
      />
    )
  }

  return (
    <div className="flex min-h-56 flex-col justify-between bg-secondary p-5 text-secondary-foreground">
      <div className="flex size-12 items-center justify-center rounded-md bg-card text-primary shadow-sm">
        <Newspaper className="size-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">WatchWeb Journal</p>
        <p className="mt-2 line-clamp-2 text-lg font-semibold tracking-normal">{article.title}</p>
      </div>
    </div>
  )
}

function estimateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 220))

  return `${minutes} min czytania`
}
