import { ArrowRight, CalendarDays, UserRound } from 'lucide-react'
import { Link } from 'react-router'

import { estimateReadingTime } from '@/entities/article/model/readingTime'
import { articleContentToText } from '@/entities/article/model/articleContent'
import type { Article } from '@/entities/article/model/types'
import { ArticleHeroVisual } from '@/entities/article/ui/ArticleHeroVisual'
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
        <ArticleHeroVisual article={article} />

        <CardContent className="flex min-w-0 flex-col gap-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Artykuł</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {formatDateTime(article.publishedAt ?? article.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <UserRound className="size-3.5" aria-hidden="true" />
              {article.authorUsername}
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="line-clamp-2 text-xl font-semibold tracking-normal text-foreground">
              <Link className="hover:text-primary" to={`/articles/${article.id}`}>
                {article.title}
              </Link>
            </h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {articleContentToText(article.content)}
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{estimateReadingTime(article.content)}</p>
            <Button asChild variant="outline">
              <Link to={`/articles/${article.id}`}>
                Szczegóły
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
