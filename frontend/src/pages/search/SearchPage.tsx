import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { AlertCircle, ArrowRight, Hash, MessageSquareText, Newspaper, Watch } from 'lucide-react'
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
import { Card, CardContent } from '@/shared/ui/card'
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
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Wyniki pojawią się po wpisaniu frazy.
          </CardContent>
        </Card>
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
        <SearchStat icon={Watch} label="Zegarki" value={formatNumber(watchesQuery.data?.totalElements)} />
        <SearchStat icon={MessageSquareText} label="Posty" value={formatNumber(postsQuery.data?.totalElements)} />
        <SearchStat icon={Newspaper} label="Artykuły" value={formatNumber(articlesQuery.data?.totalElements)} />
        <SearchStat icon={Hash} label="Hashtagi" value={formatNumber(hashtagsQuery.data?.totalElements)} />
      </section>

      <ResultSection
        error={watchesQuery.isError}
        isLoading={watchesQuery.isLoading}
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
          <EmptyResult message="Brak zegarków dla tej marki." />
        )}
      </ResultSection>

      <ResultSection
        error={postsQuery.isError}
        isLoading={postsQuery.isLoading}
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
          <EmptyResult message="Brak postów dla tej frazy." />
        )}
      </ResultSection>

      <ResultSection
        error={articlesQuery.isError}
        isLoading={articlesQuery.isLoading}
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
          <EmptyResult message="Brak artykułów dla tej frazy." />
        )}
      </ResultSection>

      <ResultSection
        error={hashtagsQuery.isError}
        isLoading={hashtagsQuery.isLoading}
        title="Hashtagi"
        total={hashtagsQuery.data?.totalElements}
      >
        {hashtags.length > 0 ? (
          <HashtagLinkList hashtags={hashtags} />
        ) : (
          <EmptyResult message="Brak hashtagów dla tej frazy." />
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

type SearchStatProps = {
  icon: typeof Watch
  label: string
  value: string
}

function SearchStat({ icon: Icon, label, value }: SearchStatProps) {
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

type ResultSectionProps = {
  title: string
  total?: number
  isLoading: boolean
  error: boolean
  viewAllHref?: string
  children: ReactNode
}

function ResultSection({ title, total, isLoading, error, viewAllHref, children }: ResultSectionProps) {
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
      {error ? <InlineError /> : null}
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

function EmptyResult({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-8 text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  )
}

function InlineError() {
  return (
    <Card className="border-destructive/40">
      <CardContent className="flex items-start gap-3 py-5 text-sm text-muted-foreground">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
        Nie udało się pobrać tej sekcji wyników.
      </CardContent>
    </Card>
  )
}

function formatNumber(value: number | undefined) {
  return value === undefined ? '-' : String(value)
}
