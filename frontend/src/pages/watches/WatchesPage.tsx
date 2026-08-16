import { AlertCircle, ListChecks, PlusCircle, RefreshCw, Star, Watch, Waves } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'

import { useWatches } from '@/entities/watch/api/useWatches'
import type { Watch as WatchModel } from '@/entities/watch/model/types'
import { WatchCard } from '@/entities/watch/ui/WatchCard'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import {
  buildWatchCatalogSearchParams,
  countActiveWatchCatalogFilters,
  parseWatchCatalogSearchParams,
  toWatchListParams,
} from '@/features/watch-catalog/model/watchCatalogFilters'
import type { WatchCatalogFilters as WatchCatalogFiltersValue } from '@/features/watch-catalog/model/watchCatalogFilters'
import { WatchCatalogFilters } from '@/features/watch-catalog/ui/WatchCatalogFilters'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Pagination } from '@/shared/ui/pagination'
import { Skeleton } from '@/shared/ui/skeleton'

export function WatchesPage() {
  const { isAuthenticated } = useAuthSession()
  const submitWatchPath = isAuthenticated
    ? '/watches/submit'
    : `/login?redirectTo=${encodeURIComponent('/watches/submit')}`
  const [searchParams, setSearchParams] = useSearchParams()
  const searchState = useMemo(() => parseWatchCatalogSearchParams(searchParams), [searchParams])
  const listParams = useMemo(() => toWatchListParams(searchState), [searchState])
  const watchesQuery = useWatches(listParams)
  const watches = watchesQuery.data?.content ?? []
  const activeFiltersCount = countActiveWatchCatalogFilters(searchState)
  const visibleStats = getVisibleStats(watches)
  const resultRange = getResultRange(
    watchesQuery.data?.number ?? searchState.page,
    watchesQuery.data?.size ?? searchState.size,
    watches.length,
  )

  function applyFilters(filters: WatchCatalogFiltersValue, pageSize: number) {
    setSearchParams(buildWatchCatalogSearchParams(filters, 0, pageSize))
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams())
  }

  function changePage(page: number) {
    setSearchParams(buildWatchCatalogSearchParams(searchState, page, searchState.size))
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">Katalog zegarków</Badge>
          <div className="mt-4 max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
              Przeglądaj modele z WatchWeb
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              Dane są pobierane z backendu i pokazują pełniejszą skalę aplikacji: katalog,
              recenzje, parametry techniczne oraz ocenę społeczności.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild>
                <Link to={submitWatchPath}>
                  <PlusCircle className="size-4" aria-hidden="true" />
                  Zgłoś zegarek
                </Link>
              </Button>
              {isAuthenticated ? (
                <Button asChild variant="outline">
                  <Link to="/me/watch-submissions">
                    <ListChecks className="size-4" aria-hidden="true" />
                    Moje zgłoszenia
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <CatalogStat
            icon={Watch}
            label="W katalogu"
            value={formatNumber(watchesQuery.data?.totalElements)}
          />
          <CatalogStat icon={Star} label="Średnia strony" value={visibleStats.averageRating} />
          <CatalogStat icon={Waves} label="Marek na stronie" value={visibleStats.brands} />
          <CatalogStat label="Zakres wyników" value={resultRange} />
        </div>
      </section>

      <WatchCatalogFilters
        activeFiltersCount={activeFiltersCount}
        isFetching={watchesQuery.isFetching}
        key={searchParams.toString()}
        onApply={applyFilters}
        onReset={resetFilters}
        pageSize={searchState.size}
        value={searchState}
      />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal text-foreground">Wyniki</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {watchesQuery.data
                ? `${watchesQuery.data.totalElements} pozycji, strona ${watchesQuery.data.number + 1}`
                : 'Ładowanie katalogu'}
            </p>
          </div>
          <Button
            disabled={watchesQuery.isFetching}
            onClick={() => void watchesQuery.refetch()}
            type="button"
            variant="outline"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Odśwież
          </Button>
        </div>

        {watchesQuery.isLoading ? <WatchCatalogSkeleton /> : null}

        {watchesQuery.isError ? (
          <Card className="border-destructive/40">
            <CardHeader className="flex-row items-start gap-3 space-y-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <AlertCircle className="size-5" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Nie udało się pobrać katalogu</CardTitle>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {watchesQuery.error instanceof Error
                    ? watchesQuery.error.message
                    : 'Spróbuj zmienić filtry albo odświeżyć dane.'}
                </p>
              </div>
            </CardHeader>
          </Card>
        ) : null}

        {watchesQuery.isSuccess && watches.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Brak zegarków dla wybranych filtrów.
            </CardContent>
          </Card>
        ) : null}

        {watches.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {watches.map((watch) => (
              <WatchCard key={watch.id} watch={watch} />
            ))}
          </div>
        ) : null}

        <Pagination
          disabled={watchesQuery.isFetching}
          onPageChange={changePage}
          page={watchesQuery.data?.number ?? searchState.page}
          totalPages={watchesQuery.data?.totalPages ?? 0}
        />
      </section>
    </div>
  )
}

type CatalogStatProps = {
  label: string
  value: string
  icon?: typeof Watch
}

function CatalogStat({ label, value, icon: Icon }: CatalogStatProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex min-h-20 flex-col justify-between gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          {Icon ? <Icon className="size-4 text-primary" aria-hidden="true" /> : null}
        </div>
        <p className="text-2xl font-semibold tracking-normal text-foreground">{value}</p>
      </div>
    </div>
  )
}

function WatchCatalogSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 12 }).map((_, index) => (
        <Skeleton key={index} className="h-64" />
      ))}
    </div>
  )
}

function getVisibleStats(watches: WatchModel[]) {
  const brands = new Set(watches.map((watch) => watch.brand)).size
  const averageRating =
    watches.length > 0
      ? watches.reduce((sum, watch) => sum + Number(watch.averageRating), 0) / watches.length
      : 0

  return {
    brands: String(brands),
    averageRating: watches.length > 0 ? averageRating.toFixed(1) : '-',
  }
}

function getResultRange(page: number, size: number, count: number) {
  if (count === 0) {
    return '-'
  }

  const first = page * size + 1
  const last = first + count - 1

  return `${first}-${last}`
}

function formatNumber(value: number | undefined) {
  return value === undefined ? '-' : String(value)
}
