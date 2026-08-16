import {
  AlertCircle,
  Hash,
  ListChecks,
  MessageSquareText,
  PlusCircle,
  RefreshCw,
  Search,
  UserRound,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'

import { useHashtags } from '@/entities/hashtag/api/useHashtags'
import { HashtagLinkList } from '@/entities/hashtag/ui/HashtagLinkList'
import { usePosts } from '@/entities/post/api/usePosts'
import type { Post } from '@/entities/post/model/types'
import { PostCard } from '@/entities/post/ui/PostCard'
import {
  buildPostListSearchParams,
  countActivePostFilters,
  parsePostListSearchParams,
  toPostListParams,
} from '@/features/post-list/model/postListFilters'
import type { PostListFilters as PostListFiltersValue } from '@/features/post-list/model/postListFilters'
import { PostListFilters } from '@/features/post-list/ui/PostListFilters'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Pagination } from '@/shared/ui/pagination'
import { Skeleton } from '@/shared/ui/skeleton'

export function PostsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuthSession()
  const searchState = useMemo(() => parsePostListSearchParams(searchParams), [searchParams])
  const listParams = useMemo(() => toPostListParams(searchState), [searchState])
  const postsQuery = usePosts(listParams)
  const hashtagsQuery = useHashtags({ size: 12, sort: 'name,asc' })
  const posts = postsQuery.data?.content ?? []
  const hashtags = hashtagsQuery.data?.content.map((hashtag) => hashtag.name) ?? []
  const activeFiltersCount = countActivePostFilters(searchState)
  const visibleStats = getVisibleStats(posts)
  const createPostHref = isAuthenticated
    ? '/posts/new'
    : `/login?redirectTo=${encodeURIComponent('/posts/new')}`
  const myPostsHref = isAuthenticated
    ? '/me/posts'
    : `/login?redirectTo=${encodeURIComponent('/me/posts')}`

  function applyFilters(filters: PostListFiltersValue, pageSize: number) {
    setSearchParams(buildPostListSearchParams(filters, 0, pageSize))
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams())
  }

  function changePage(page: number) {
    setSearchParams(buildPostListSearchParams(searchState, page, searchState.size))
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">Społeczność</Badge>
          <div className="mt-4 max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
              Przeglądaj posty społeczności
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              Publiczny strumień zaakceptowanych wpisów użytkowników. Możesz wyszukiwać po
              treści, filtrować po hashtagu i przejść do dyskusji pod konkretnym postem.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to={createPostHref}>
                  <PlusCircle className="size-4" aria-hidden="true" />
                  Dodaj post
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={myPostsHref}>
                  <ListChecks className="size-4" aria-hidden="true" />
                  Moje posty
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <PostStat
            icon={MessageSquareText}
            label="W strumieniu"
            value={formatNumber(postsQuery.data?.totalElements)}
          />
          <PostStat icon={Search} label="Na stronie" value={String(posts.length)} />
          <PostStat icon={UserRound} label="Autorzy" value={visibleStats.authors} />
          <PostStat icon={Hash} label="Hashtagi" value={visibleStats.hashtags} />
        </div>
      </section>

      <PostListFilters
        activeFiltersCount={activeFiltersCount}
        isFetching={postsQuery.isFetching}
        key={searchParams.toString()}
        onApply={applyFilters}
        onReset={resetFilters}
        pageSize={searchState.size}
        value={searchState}
      />

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Hashtagi</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {hashtagsQuery.isFetching ? 'Odświeżanie listy' : 'Szybkie filtrowanie postów'}
            </p>
          </div>
          <Badge variant="secondary">{formatNumber(hashtagsQuery.data?.totalElements)}</Badge>
        </CardHeader>
        <CardContent>
          {hashtags.length > 0 ? (
            <HashtagLinkList hashtags={hashtags} />
          ) : (
            <p className="text-sm text-muted-foreground">Hashtagi pojawią się po dodaniu postów.</p>
          )}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal text-foreground">Posty</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {postsQuery.data
                ? `${postsQuery.data.totalElements} postów, strona ${postsQuery.data.number + 1}`
                : 'Ładowanie postów'}
            </p>
          </div>
          <Button
            disabled={postsQuery.isFetching}
            onClick={() => void postsQuery.refetch()}
            type="button"
            variant="outline"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Odśwież
          </Button>
        </div>

        {postsQuery.isLoading ? <PostListSkeleton /> : null}

        {postsQuery.isError ? (
          <Card className="border-destructive/40">
            <CardHeader className="flex-row items-start gap-3 space-y-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <AlertCircle className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Nie udało się pobrać postów</CardTitle>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {postsQuery.error instanceof Error
                    ? postsQuery.error.message
                    : 'Spróbuj zmienić filtry albo odświeżyć dane.'}
                </p>
              </div>
            </CardHeader>
          </Card>
        ) : null}

        {postsQuery.isSuccess && posts.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Brak postów dla wybranych filtrów.
            </CardContent>
          </Card>
        ) : null}

        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : null}

        <Pagination
          disabled={postsQuery.isFetching}
          onPageChange={changePage}
          page={postsQuery.data?.number ?? searchState.page}
          totalPages={postsQuery.data?.totalPages ?? 0}
        />
      </section>
    </div>
  )
}

type PostStatProps = {
  icon: typeof MessageSquareText
  label: string
  value: string
}

function PostStat({ icon: Icon, label, value }: PostStatProps) {
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

function PostListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton className="h-72" key={index} />
      ))}
    </div>
  )
}

function getVisibleStats(posts: Post[]) {
  return {
    authors: String(new Set(posts.map((post) => post.authorUsername)).size),
    hashtags: String(new Set(posts.flatMap((post) => post.hashtags)).size),
  }
}

function formatNumber(value: number | undefined) {
  return value === undefined ? '-' : String(value)
}
