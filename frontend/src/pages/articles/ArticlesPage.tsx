import { AlertCircle, BookOpenText, Newspaper, RefreshCw, Search, UserRound } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { useArticles } from '@/entities/article/api/useArticles'
import type { Article } from '@/entities/article/model/types'
import { ArticleCard } from '@/entities/article/ui/ArticleCard'
import {
  buildArticleListSearchParams,
  countActiveArticleFilters,
  parseArticleListSearchParams,
  toArticleListParams,
} from '@/features/article-list/model/articleListFilters'
import type { ArticleListFilters as ArticleListFiltersValue } from '@/features/article-list/model/articleListFilters'
import { ArticleListFilters } from '@/features/article-list/ui/ArticleListFilters'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Pagination } from '@/shared/ui/pagination'
import { Skeleton } from '@/shared/ui/skeleton'

export function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchState = useMemo(() => parseArticleListSearchParams(searchParams), [searchParams])
  const listParams = useMemo(() => toArticleListParams(searchState), [searchState])
  const articlesQuery = useArticles(listParams)
  const articles = articlesQuery.data?.content ?? []
  const activeFiltersCount = countActiveArticleFilters(searchState)
  const visibleStats = getVisibleStats(articles)

  function applyFilters(filters: ArticleListFiltersValue, pageSize: number) {
    setSearchParams(buildArticleListSearchParams(filters, 0, pageSize))
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams())
  }

  function changePage(page: number) {
    setSearchParams(buildArticleListSearchParams(searchState, page, searchState.size))
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">Artykuły</Badge>
          <div className="mt-4 max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
              Czytaj materiały branżowe
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              Lista artykułów jest podłączona do backendu, obsługuje wyszukiwanie po treści
              i pokazuje skalę redakcyjnej części WatchWeb.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ArticleStat
            icon={Newspaper}
            label="W archiwum"
            value={formatNumber(articlesQuery.data?.totalElements)}
          />
          <ArticleStat icon={BookOpenText} label="Na stronie" value={String(articles.length)} />
          <ArticleStat icon={UserRound} label="Autorzy" value={visibleStats.authors} />
          <ArticleStat icon={Search} label="Tryb" value={activeFiltersCount > 0 ? 'Wyniki' : 'Archiwum'} />
        </div>
      </section>

      <ArticleListFilters
        activeFiltersCount={activeFiltersCount}
        isFetching={articlesQuery.isFetching}
        key={searchParams.toString()}
        onApply={applyFilters}
        onReset={resetFilters}
        pageSize={searchState.size}
        value={searchState}
      />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal text-foreground">Archiwum</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {articlesQuery.data
                ? `${articlesQuery.data.totalElements} artykułów, strona ${articlesQuery.data.number + 1}`
                : 'Ładowanie artykułów'}
            </p>
          </div>
          <Button
            disabled={articlesQuery.isFetching}
            onClick={() => void articlesQuery.refetch()}
            type="button"
            variant="outline"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Odśwież
          </Button>
        </div>

        {articlesQuery.isLoading ? <ArticleListSkeleton /> : null}

        {articlesQuery.isError ? (
          <Card className="border-destructive/40">
            <CardHeader className="flex-row items-start gap-3 space-y-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <AlertCircle className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Nie udało się pobrać artykułów</CardTitle>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {articlesQuery.error instanceof Error
                    ? articlesQuery.error.message
                    : 'Spróbuj zmienić filtry albo odświeżyć dane.'}
                </p>
              </div>
            </CardHeader>
          </Card>
        ) : null}

        {articlesQuery.isSuccess && articles.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Brak artykułów dla wybranej frazy.
            </CardContent>
          </Card>
        ) : null}

        {articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard article={article} key={article.id} />
            ))}
          </div>
        ) : null}

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

type ArticleStatProps = {
  icon: typeof Newspaper
  label: string
  value: string
}

function ArticleStat({ icon: Icon, label, value }: ArticleStatProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex min-h-20 flex-col justify-between gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="size-4 text-primary" aria-hidden="true" />
        </div>
        <p className="text-2xl font-semibold tracking-normal text-foreground">{value}</p>
      </div>
    </div>
  )
}

function ArticleListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton className="h-72" key={index} />
      ))}
    </div>
  )
}

function getVisibleStats(articles: Article[]) {
  return {
    authors: String(new Set(articles.map((article) => article.authorUsername)).size),
  }
}

function formatNumber(value: number | undefined) {
  return value === undefined ? '-' : String(value)
}
