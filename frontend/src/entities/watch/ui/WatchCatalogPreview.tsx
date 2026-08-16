import { AlertCircle } from 'lucide-react'

import { useWatches } from '@/entities/watch/api/useWatches'
import { WatchCard } from '@/entities/watch/ui/WatchCard'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
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
        <Card className="border-destructive/40">
          <CardHeader className="flex-row items-start gap-3 space-y-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <AlertCircle className="size-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>Nie udało się pobrać katalogu</CardTitle>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Sprawdź, czy backend działa i czy `/api/watches` odpowiada.
              </p>
            </div>
          </CardHeader>
        </Card>
      ) : null}

      {watchesQuery.isSuccess && watches.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Katalog jest pusty. Po dodaniu danych zatwierdzone zegarki pojawią się tutaj.
          </CardContent>
        </Card>
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
