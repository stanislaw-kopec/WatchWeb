import { ArrowLeft, FilePenLine, FileText, PlusCircle, RefreshCw } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'

import { useMyArticles } from '@/entities/article/api/useArticles'
import { MyArticleCard } from '@/entities/article/ui/MyArticleCard'
import { ArticleActions } from '@/features/article-manage/ui/ArticleActions'
import {
  buildMyArticleListSearchParams,
  parseMyArticleListSearchParams,
  toMyArticleListParams,
} from '@/features/my-articles/model/myArticleListFilters'
import type { MyArticleStatusFilter as MyArticleStatusFilterValue } from '@/features/my-articles/model/myArticleListFilters'
import { MyArticleStatusFilter } from '@/features/my-articles/ui/MyArticleStatusFilter'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { Pagination } from '@/shared/ui/pagination'
import { Skeleton } from '@/shared/ui/skeleton'

export function MyArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchState = useMemo(() => parseMyArticleListSearchParams(searchParams), [searchParams])
  const listParams = useMemo(() => toMyArticleListParams(searchState), [searchState])
  const articlesQuery = useMyArticles(listParams)
  const articles = articlesQuery.data?.content ?? []

  function changeStatus(status: MyArticleStatusFilterValue) {
    setSearchParams(buildMyArticleListSearchParams(status, 0, searchState.size))
  }

  function changePage(page: number) {
    setSearchParams(buildMyArticleListSearchParams(searchState.status, page, searchState.size))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/articles">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Wróć do artykułów
          </Link>
        </Button>
        <Button asChild>
          <Link to="/articles/new">
            <PlusCircle className="size-4" aria-hidden="true" />
            Nowy artykuł
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">Moje artykuły</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-foreground md:text-4xl">Materiały redakcyjne</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Zarządzaj prywatnymi wersjami roboczymi i opublikowanymi artykułami w jednym miejscu.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ArticleStat icon={FileText} label="Wyniki" value={formatNumber(articlesQuery.data?.totalElements)} />
          <ArticleStat icon={FilePenLine} label="Na stronie" value={String(articles.length)} />
        </div>
      </section>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Filtr statusu</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{articlesQuery.isFetching ? 'Odświeżanie listy' : 'Gotowe'}</p>
          </div>
          <Button disabled={articlesQuery.isFetching} onClick={() => void articlesQuery.refetch()} type="button" variant="outline">
            <RefreshCw className="size-4" aria-hidden="true" />
            Odśwież
          </Button>
        </CardHeader>
        <CardContent>
          <MyArticleStatusFilter disabled={articlesQuery.isFetching} onChange={changeStatus} value={searchState.status} />
        </CardContent>
      </Card>

      <section className="space-y-4">
        {articlesQuery.isLoading ? <MyArticlesSkeleton /> : null}
        {articlesQuery.isError ? (
          <ErrorState
            description="Nie mogliśmy odświeżyć listy Twoich artykułów."
            isRetrying={articlesQuery.isFetching}
            onRetry={() => void articlesQuery.refetch()}
            title="Nie udało się pobrać artykułów"
          />
        ) : null}
        {articlesQuery.isSuccess && articles.length === 0 ? (
          <EmptyState description="Wybierz inny status albo utwórz nowy artykuł." title="Brak artykułów dla wybranego statusu" />
        ) : null}
        {articles.map((article) => (
          <MyArticleCard
            actions={<ArticleActions afterDeletePath="/me/articles" article={article} />}
            article={article}
            key={article.id}
          />
        ))}
        <Pagination
          disabled={articlesQuery.isFetching}
          onPageChange={changePage}
          page={articlesQuery.data?.number ?? searchState.page}
          totalPages={articlesQuery.data?.totalPages ?? 0}
        />
      </section>
    </div>
  )
}

function ArticleStat({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex min-h-20 flex-col justify-between gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="size-4 text-primary" aria-hidden="true" />
        </div>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

function MyArticlesSkeleton() {
  return <div className="space-y-4">{Array.from({ length: 3 }).map((_, index) => <Skeleton className="h-64" key={index} />)}</div>
}

function formatNumber(value: number | undefined) {
  return value === undefined ? '-' : String(value)
}
