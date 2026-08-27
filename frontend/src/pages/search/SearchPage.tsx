import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ArrowRight, Hash, MessageSquareText, Newspaper, Watch } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'

import { getArticles } from '@/entities/article/api/articleApi'
import { ArticleCard } from '@/entities/article/ui/ArticleCard'
import { getHashtags } from '@/entities/hashtag/api/hashtagApi'
import { HashtagLinkList } from '@/entities/hashtag/ui/HashtagLinkList'
import { getPosts } from '@/entities/post/api/postApi'
import { PostCard } from '@/entities/post/ui/PostCard'
import { getWatches } from '@/entities/watch/api/watchApi'
import { WatchCard } from '@/entities/watch/ui/WatchCard'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { MetricCard } from '@/shared/ui/metric-card'
import { Skeleton } from '@/shared/ui/skeleton'

const SEARCH_PAGE_SIZE = 4
const HASHTAG_SEARCH_SIZE = 12

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('query') ?? '').trim()
  const enabled = query.length > 0

  const watchesQuery = useQuery({
    enabled,
    queryKey: ['global-search', 'watches', query],
    queryFn: () => getWatches({ brand: query, size: SEARCH_PAGE_SIZE }),
  })
  const postsQuery = useQuery({
    enabled,
    queryKey: ['global-search', 'posts', query],
    queryFn: () => getPosts({ query, size: SEARCH_PAGE_SIZE }),
  })
  const articlesQuery = useQuery({
    enabled,
    queryKey: ['global-search', 'articles', query],
    queryFn: () => getArticles({ query, size: SEARCH_PAGE_SIZE }),
  })
  const hashtagsQuery = useQuery({
    enabled,
    queryKey: ['global-search', 'hashtags', query],
    queryFn: () => getHashtags({ query, size: HASHTAG_SEARCH_SIZE }),
  })

  const watches = watchesQuery.data?.content ?? []
  const posts = postsQuery.data?.content ?? []
  const articles = articlesQuery.data?.content ?? []
  const hashtags = hashtagsQuery.data?.content.map((hashtag) => hashtag.name) ?? []
  const totalResults =
    (watchesQuery.data?.totalElements ?? 0) +
    (postsQuery.data?.totalElements ?? 0) +
    (articlesQuery.data?.totalElements ?? 0) +
    (hashtagsQuery.data?.totalElements ?? 0)

  if (!enabled) {
    return (
      <div className="space-y-6">
        <SearchHero
          description="Wpisz frazę w górnym pasku, żeby przeszukać katalog, społeczność, artykuły i hashtagi."
          label="Wyszukiwanie"
          title="Szukaj w WatchWeb"
        />
        <EmptyState
          description="Użyj pola wyszukiwania w nagłówku aplikacji."
          size="compact"
          title="Wyniki pojawią się po wpisaniu frazy"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SearchHero
        description={`${totalResults} wyników dla wpisanej frazy.`}
        label="Wyniki"
        title={`Szukasz: ${query}`}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Watch} label="Zegarki" value={formatNumber(watchesQuery.data?.totalElements)} />
        <MetricCard icon={MessageSquareText} label="Posty" value={formatNumber(postsQuery.data?.totalElements)} />
        <MetricCard icon={Newspaper} label="Artykuły" value={formatNumber(articlesQuery.data?.totalElements)} />
        <MetricCard icon={Hash} label="Hashtagi" value={formatNumber(hashtagsQuery.data?.totalElements)} />
      </section>

      <ResultSection
        error={watchesQuery.isError}
        isLoading={watchesQuery.isLoading}
        isRetrying={watchesQuery.isFetching}
        onRetry={() => void watchesQuery.refetch()}
        title="Katalog"
        total={watchesQuery.data?.totalElements}
        viewAllHref={`/watches?brand=${encodeURIComponent(query)}`}
      >
        {watches.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {watches.map((watch) => (
              <WatchCard key={watch.id} watch={watch} />
            ))}
          </div>
        ) : (
          <EmptyState size="compact" title="Brak zegarków dla tej marki" />
        )}
      </ResultSection>

      <ResultSection
        error={postsQuery.isError}
        isLoading={postsQuery.isLoading}
        isRetrying={postsQuery.isFetching}
        onRetry={() => void postsQuery.refetch()}
        title="Posty"
        total={postsQuery.data?.totalElements}
        viewAllHref={`/posts?query=${encodeURIComponent(query)}`}
      >
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState size="compact" title="Brak postów dla tej frazy" />
        )}
      </ResultSection>

      <ResultSection
        error={articlesQuery.isError}
        isLoading={articlesQuery.isLoading}
        isRetrying={articlesQuery.isFetching}
        onRetry={() => void articlesQuery.refetch()}
        title="Artykuły"
        total={articlesQuery.data?.totalElements}
        viewAllHref={`/articles?query=${encodeURIComponent(query)}`}
      >
        {articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard article={article} key={article.id} />
            ))}
          </div>
        ) : (
          <EmptyState size="compact" title="Brak artykułów dla tej frazy" />
        )}
      </ResultSection>

      <ResultSection
        error={hashtagsQuery.isError}
        isLoading={hashtagsQuery.isLoading}
        isRetrying={hashtagsQuery.isFetching}
        onRetry={() => void hashtagsQuery.refetch()}
        title="Hashtagi"
        total={hashtagsQuery.data?.totalElements}
      >
        {hashtags.length > 0 ? (
          <HashtagLinkList hashtags={hashtags} />
        ) : (
          <EmptyState size="compact" title="Brak hashtagów dla tej frazy" />
        )}
      </ResultSection>
    </div>
  )
}

type SearchHeroProps = {
  label: string
  title: string
  description: string
}

function SearchHero({ label, title, description }: SearchHeroProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
      <Badge variant="secondary">{label}</Badge>
      <div className="mt-4 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
          {description}
        </p>
      </div>
    </section>
  )
}

type ResultSectionProps = {
  title: string
  total?: number
  isLoading: boolean
  isRetrying: boolean
  error: boolean
  onRetry: () => void
  viewAllHref?: string
  children: ReactNode
}

function ResultSection({
  title,
  total,
  isLoading,
  isRetrying,
  error,
  onRetry,
  viewAllHref,
  children,
}: ResultSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {total === undefined ? 'Ładowanie wyników' : `${total} wyników`}
          </p>
        </div>
        {viewAllHref ? (
          <Button asChild variant="outline">
            <Link to={viewAllHref}>
              Zobacz więcej
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : null}
      </div>

      {isLoading ? <ResultSkeleton /> : null}
      {error ? (
        <ErrorState
          isRetrying={isRetrying}
          onRetry={onRetry}
          size="compact"
          title="Nie udało się pobrać tej sekcji wyników"
        />
      ) : null}
      {!isLoading && !error ? children : null}
    </section>
  )
}

function ResultSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  )
}

function formatNumber(value: number | undefined) {
  return value === undefined ? '-' : String(value)
}
