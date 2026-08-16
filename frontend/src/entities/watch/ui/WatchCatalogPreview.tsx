import { useWatches } from '@/entities/watch/api/useWatches'
import { WatchCard } from '@/entities/watch/ui/WatchCard'
import { Badge } from '@/shared/ui/badge'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { Skeleton } from '@/shared/ui/skeleton'

const previewParams = {
  size: 4,
  sort: 'createdAt,desc',
}

export function WatchCatalogPreview() {
  const watchesQuery = useWatches(previewParams)
  const watches = watchesQuery.data?.content ?? []

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary">Live API</Badge>
          <h2 className="mt-3 text-2xl font-semibold tracking-normal text-foreground">Najnowsze zegarki</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Dane ładowane z backendu przez proxy frontendu.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {watchesQuery.data ? `${watchesQuery.data.totalElements} pozycji w katalogu` : 'Ładowanie katalogu'}
        </p>
      </div>

      {watchesQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-56" />
          ))}
        </div>
      ) : null}

      {watchesQuery.isError ? (
        <ErrorState
          description="Sprawdź połączenie i spróbuj ponownie za chwilę."
          isRetrying={watchesQuery.isFetching}
          onRetry={() => void watchesQuery.refetch()}
          size="compact"
          title="Nie udało się pobrać katalogu"
        />
      ) : null}

      {watchesQuery.isSuccess && watches.length === 0 ? (
        <EmptyState
          description="Po dodaniu danych zatwierdzone zegarki pojawią się tutaj."
          size="compact"
          title="Katalog jest pusty"
        />
      ) : null}

      {watches.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {watches.map((watch) => (
            <WatchCard key={watch.id} watch={watch} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
