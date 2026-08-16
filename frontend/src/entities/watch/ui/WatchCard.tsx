import { Star } from 'lucide-react'

import type { Watch } from '@/entities/watch/model/types'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

type WatchCardProps = {
  watch: Watch
}

export function WatchCard({ watch }: WatchCardProps) {
  const diameter = watch.details?.caseDiameterMm
  const movementType = watch.details?.movementType

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {watch.brand}
            </p>
            <CardTitle className="mt-1">{watch.model}</CardTitle>
          </div>
          {movementType ? <Badge variant="outline">{movementType}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Ref.</p>
            <p className="font-medium text-foreground">{watch.referenceCode}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Koperta</p>
            <p className="font-medium text-foreground">{diameter ? `${diameter} mm` : 'brak danych'}</p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-1 text-sm font-medium text-foreground">
            <Star className="size-4 fill-accent text-accent" aria-hidden="true" />
            {Number(watch.averageRating).toFixed(1)}
          </div>
          <p className="text-sm text-muted-foreground">{watch.reviewsCount} recenzji</p>
        </div>
      </CardContent>
    </Card>
  )
}
