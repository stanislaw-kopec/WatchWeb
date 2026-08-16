import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'

import { usePostModerationQueue } from '@/entities/post/api/usePostModeration'
import type { Post, PostStatus } from '@/entities/post/model/types'
import { ModerationPostCard } from '@/entities/post/ui/ModerationPostCard'
import {
  buildPostModerationSearchParams,
  parsePostModerationSearchParams,
  POST_MODERATION_PAGE_SIZES,
  toPostModerationListParams,
} from '@/features/post-moderation/model/postModerationFilters'
import type { PostModerationStatusFilter as PostModerationStatusFilterValue } from '@/features/post-moderation/model/postModerationFilters'
import { PostModerationActions } from '@/features/post-moderation/ui/PostModerationActions'
import { PostModerationStatusFilter } from '@/features/post-moderation/ui/PostModerationStatusFilter'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Pagination } from '@/shared/ui/pagination'
import { Select } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

export function ModerationPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchState = useMemo(() => parsePostModerationSearchParams(searchParams), [searchParams])
  const listParams = useMemo(() => toPostModerationListParams(searchState), [searchState])
  const moderationQuery = usePostModerationQueue(listParams)
  const posts = moderationQuery.data?.content ?? []
  const visibleStats = getVisibleStatusStats(posts)

  function changeStatus(status: PostModerationStatusFilterValue) {
    setSearchParams(buildPostModerationSearchParams(status, 0, searchState.size))
  }

  function changePage(page: number) {
    setSearchParams(buildPostModerationSearchParams(searchState.status, page, searchState.size))
  }

  function changePageSize(size: number) {
    setSearchParams(buildPostModerationSearchParams(searchState.status, 0, size))
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">Moderacja</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
            Kolejka postów
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Moderator lub administrator może zatwierdzać oczekujące wpisy społeczności albo
            odrzucać je z powodem widocznym później dla autora.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ModerationStat
            icon={FileText}
            label="Wyniki"
            value={formatNumber(moderationQuery.data?.totalElements)}
          />
          <ModerationStat icon={Clock} label="Oczekujące" value={visibleStats.pending} />
          <ModerationStat icon={CheckCircle2} label="Zatwierdzone" value={visibleStats.approved} />
          <ModerationStat icon={XCircle} label="Odrzucone" value={visibleStats.rejected} />
        </div>
      </section>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Filtry kolejki</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {moderationQuery.data
                ? `${moderationQuery.data.totalElements} wpisów, strona ${moderationQuery.data.number + 1}`
                : 'Ładowanie kolejki'}
            </p>
          </div>
          <Button
            disabled={moderationQuery.isFetching}
            onClick={() => void moderationQuery.refetch()}
            type="button"
            variant="outline"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Odśwież
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Status</span>
            <PostModerationStatusFilter
              disabled={moderationQuery.isFetching}
              onChange={changeStatus}
              value={searchState.status}
            />
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Na stronie</span>
            <Select
              disabled={moderationQuery.isFetching}
              onChange={(event) => changePageSize(Number(event.target.value))}
              value={searchState.size}
            >
              {POST_MODERATION_PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </label>
        </CardContent>
      </Card>

      <section className="space-y-4">
        {moderationQuery.isLoading ? <ModerationSkeleton /> : null}

        {moderationQuery.isError ? (
          <Card className="border-destructive/40">
            <CardHeader className="flex-row items-start gap-3 space-y-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <AlertCircle className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Nie udało się pobrać kolejki moderacji</CardTitle>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {moderationQuery.error instanceof Error
                    ? moderationQuery.error.message
                    : 'Sprawdź, czy masz aktywną sesję moderatora albo administratora.'}
                </p>
              </div>
            </CardHeader>
          </Card>
        ) : null}

        {moderationQuery.isSuccess && posts.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nie ma postów dla wybranego statusu.
            </CardContent>
          </Card>
        ) : null}

        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <ModerationPostCard
                actions={<PostModerationActions post={post} />}
                key={post.id}
                post={post}
              />
            ))}
          </div>
        ) : null}

        <Pagination
          disabled={moderationQuery.isFetching}
          onPageChange={changePage}
          page={moderationQuery.data?.number ?? searchState.page}
          totalPages={moderationQuery.data?.totalPages ?? 0}
        />
      </section>
    </div>
  )
}

type ModerationStatProps = {
  icon: typeof ShieldCheck
  label: string
  value: string
}

function ModerationStat({ icon: Icon, label, value }: ModerationStatProps) {
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

function ModerationSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton className="h-72" key={index} />
      ))}
    </div>
  )
}

function getVisibleStatusStats(posts: Post[]) {
  return {
    pending: String(countByStatus(posts, 'PENDING')),
    approved: String(countByStatus(posts, 'APPROVED')),
    rejected: String(countByStatus(posts, 'REJECTED')),
  }
}

function countByStatus(posts: Post[], status: PostStatus) {
  return posts.filter((post) => post.status === status).length
}

function formatNumber(value: number | undefined) {
  return value === undefined ? '-' : String(value)
}
