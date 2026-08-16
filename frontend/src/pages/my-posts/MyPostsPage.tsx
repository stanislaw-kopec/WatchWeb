import { ArrowLeft, FileText, PlusCircle, RefreshCw } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'

import { useMyPosts } from '@/entities/post/api/usePosts'
import { MyPostCard } from '@/entities/post/ui/MyPostCard'
import {
  buildMyPostListSearchParams,
  parseMyPostListSearchParams,
  toMyPostListParams,
} from '@/features/my-posts/model/myPostListFilters'
import type { MyPostStatusFilter as MyPostStatusFilterValue } from '@/features/my-posts/model/myPostListFilters'
import { MyPostStatusFilter } from '@/features/my-posts/ui/MyPostStatusFilter'
import { MyPostActions } from '@/features/post-manage/ui/MyPostActions'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { Pagination } from '@/shared/ui/pagination'
import { Skeleton } from '@/shared/ui/skeleton'

export function MyPostsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchState = useMemo(() => parseMyPostListSearchParams(searchParams), [searchParams])
  const listParams = useMemo(() => toMyPostListParams(searchState), [searchState])
  const postsQuery = useMyPosts(listParams)
  const posts = postsQuery.data?.content ?? []

  function changeStatus(status: MyPostStatusFilterValue) {
    setSearchParams(buildMyPostListSearchParams(status, 0, searchState.size))
  }

  function changePage(page: number) {
    setSearchParams(buildMyPostListSearchParams(searchState.status, page, searchState.size))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/posts">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Wróć do postów
          </Link>
        </Button>
        <Button asChild>
          <Link to="/posts/new">
            <PlusCircle className="size-4" aria-hidden="true" />
            Nowy post
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">Moje posty</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
            Statusy wpisów
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Tu widzisz swoje posty przed publikacją, po akceptacji oraz po odrzuceniu z powodem.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MyPostStat icon={FileText} label="Wyniki" value={formatNumber(postsQuery.data?.totalElements)} />
          <MyPostStat icon={FileText} label="Na stronie" value={String(posts.length)} />
        </div>
      </section>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Filtr statusu</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {postsQuery.isFetching ? 'Odświeżanie listy' : 'Gotowe'}
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
        </CardHeader>
        <CardContent>
          <MyPostStatusFilter
            disabled={postsQuery.isFetching}
            onChange={changeStatus}
            value={searchState.status}
          />
        </CardContent>
      </Card>

      <section className="space-y-4">
        {postsQuery.isLoading ? <MyPostsSkeleton /> : null}

        {postsQuery.isError ? (
          <ErrorState
            description="Nie mogliśmy odświeżyć listy Twoich wpisów."
            isRetrying={postsQuery.isFetching}
            onRetry={() => void postsQuery.refetch()}
            title="Nie udało się pobrać Twoich postów"
          />
        ) : null}

        {postsQuery.isSuccess && posts.length === 0 ? (
          <EmptyState
            description="Wybierz inny status albo utwórz nowy post."
            title="Brak postów dla wybranego statusu"
          />
        ) : null}

        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <MyPostCard
                actions={<MyPostActions post={post} />}
                key={post.id}
                post={post}
              />
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

type MyPostStatProps = {
  icon: typeof FileText
  label: string
  value: string
}

function MyPostStat({ icon: Icon, label, value }: MyPostStatProps) {
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

function MyPostsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton className="h-64" key={index} />
      ))}
    </div>
  )
}

function formatNumber(value: number | undefined) {
  return value === undefined ? '-' : String(value)
}
