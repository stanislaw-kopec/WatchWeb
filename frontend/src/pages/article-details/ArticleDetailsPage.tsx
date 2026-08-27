import { ArrowLeft, BookOpenText, CalendarDays, FileText, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { useArticle } from '@/entities/article/api/useArticles'
import { countWords, estimateReadingTime } from '@/entities/article/model/readingTime'
import { articleContentToText } from '@/entities/article/model/articleContent'
import { ArticleHeroVisual } from '@/entities/article/ui/ArticleHeroVisual'
import { RichArticleContent } from '@/entities/article/ui/RichArticleContent'
import type { User } from '@/entities/user/model/types'
import { ArticleActions } from '@/features/article-manage/ui/ArticleActions'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { formatDateTime } from '@/shared/lib/date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ErrorState } from '@/shared/ui/error-state'
import { MetricCard } from '@/shared/ui/metric-card'
import { Skeleton } from '@/shared/ui/skeleton'

export function ArticleDetailsPage() {
  const { articleId } = useParams()
  const articleQuery = useArticle(articleId)
  const { user } = useAuthSession()

  if (articleQuery.isLoading) {
    return <ArticleDetailsSkeleton />
  }

  if (articleQuery.isError || !articleQuery.data) {
    return (
      <ErrorState
        description="Sprawdź, czy wybrany materiał nadal jest dostępny w archiwum."
        isRetrying={articleQuery.isFetching}
        onRetry={() => void articleQuery.refetch()}
        title="Nie udało się pobrać artykułu"
      />
    )
  }

  const article = articleQuery.data
  const canManageArticle = user ? canManageArticleForUser(article, user) : false

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link to="/articles">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Wróć do artykułów
        </Link>
      </Button>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="p-6 md:p-8">
            <Badge variant="secondary">Artykuł</Badge>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <UserRound className="size-4" aria-hidden="true" />
                {article.authorUsername}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-4" aria-hidden="true" />
                {formatDateTime(article.publishedAt ?? article.createdAt)}
              </span>
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-normal text-foreground md:text-5xl">
              {article.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
              {getLead(article.content)}
            </p>
          </div>

          <ArticleHeroVisual article={article} variant="hero" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <RichArticleContent className="text-base leading-8 text-foreground" content={article.content} />
        </article>

        <aside className="space-y-4">
          <MetricCard icon={BookOpenText} label="Czas czytania" value={estimateReadingTime(article.content)} valueClassName="text-xl" />
          <MetricCard icon={FileText} label="Liczba słów" value={String(countWords(article.content))} valueClassName="text-xl" />
          <MetricCard icon={CalendarDays} label="Ostatnia aktualizacja" value={formatDateTime(article.updatedAt)} valueClassName="text-xl" />
          <Card>
            <CardHeader>
              <CardTitle>Autor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-foreground">{article.authorUsername}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Materiał redakcyjny opublikowany w WatchWeb Journal.
              </p>
            </CardContent>
          </Card>
          {canManageArticle ? (
            <Card>
              <CardHeader>
                <CardTitle>Zarządzanie</CardTitle>
              </CardHeader>
              <CardContent>
                <ArticleActions article={article} />
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </section>
    </div>
  )
}

function ArticleDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-96" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Skeleton className="h-96" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-28" key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

function getLead(content: string) {
  const firstParagraph = articleContentToText(content)

  return firstParagraph.length > 220 ? `${firstParagraph.slice(0, 217).trim()}...` : firstParagraph
}

function canManageArticleForUser(article: { authorId: string }, user: User) {
  return user.role === 'ROLE_ADMIN' || (user.role === 'ROLE_JOURNALIST' && article.authorId === user.id)
}
