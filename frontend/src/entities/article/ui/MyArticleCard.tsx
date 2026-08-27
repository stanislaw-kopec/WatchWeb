import { ArrowRight, CalendarDays, Newspaper } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { articleContentToText } from '@/entities/article/model/articleContent'
import { ARTICLE_STATUS_DESCRIPTIONS } from '@/entities/article/model/articleStatus'
import type { Article } from '@/entities/article/model/types'
import { ArticleStatusBadge } from '@/entities/article/ui/ArticleStatusBadge'
import { formatDateTime } from '@/shared/lib/date'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

type MyArticleCardProps = {
  article: Article
  actions?: ReactNode
}

export function MyArticleCard({ article, actions }: MyArticleCardProps) {
  const title = article.title || 'Bez tytułu'
  const text = articleContentToText(article.content)

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[240px_1fr]">
        {article.headerImageUrl ? (
          <img alt="" className="h-48 w-full bg-secondary/45 object-contain lg:h-full" src={article.headerImageUrl} />
        ) : (
          <div className="flex min-h-48 items-center justify-center bg-secondary text-primary">
            <Newspaper className="size-12" aria-hidden="true" />
          </div>
        )}

        <CardContent className="flex min-w-0 flex-col gap-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <ArticleStatusBadge status={article.status} />
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Zmieniono {formatDateTime(article.updatedAt)}
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="line-clamp-2 text-xl font-semibold tracking-normal text-foreground">{title}</h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {text || 'Ten szkic nie ma jeszcze treści.'}
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{ARTICLE_STATUS_DESCRIPTIONS[article.status]}</p>
            {article.status === 'PUBLISHED' ? (
              <Button asChild variant="outline">
                <Link to={`/articles/${article.id}`}>
                  Zobacz publicznie
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
          </div>

          {actions ? <div className="border-t border-border pt-4">{actions}</div> : null}
        </CardContent>
      </div>
    </Card>
  )
}
