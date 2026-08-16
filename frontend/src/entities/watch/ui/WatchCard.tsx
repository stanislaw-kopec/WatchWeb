import { Gauge, Ruler, Star, Waves } from 'lucide-react'

import { formatMovementType } from '@/entities/watch/model/movementType'
import type { Watch } from '@/entities/watch/model/types'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

type WatchCardProps = {
  watch: Watch
}

export function WatchCard({ watch }: WatchCardProps) {
  const diameter = watch.details?.caseDiameterMm
  const movementType = watch.details?.movementType
  const waterResistance = watch.details?.waterResistanceM
  const caliber = watch.details?.caliber

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {watch.brand}
            </p>
            <CardTitle className="mt-1 line-clamp-2">{watch.model}</CardTitle>
          </div>
          <Badge className="shrink-0" variant="outline">
            {formatMovementType(movementType)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-border bg-secondary/45 p-3">
          <p className="text-xs text-muted-foreground">Referencja</p>
          <p className="mt-1 truncate text-sm font-medium text-foreground">{watch.referenceCode}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <WatchFact icon={Ruler} label="Koperta" value={diameter ? `${diameter} mm` : '-'} />
          <WatchFact icon={Waves} label="WR" value={waterResistance ? `${waterResistance} m` : '-'} />
          <WatchFact icon={Gauge} label="Kaliber" value={caliber ?? '-'} />
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

type WatchFactProps = {
  icon: typeof Ruler
  label: string
  value: string
}

function WatchFact({ icon: Icon, label, value }: WatchFactProps) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center gap-1 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        <p className="truncate text-xs">{label}</p>
      </div>
      <p className="truncate font-medium text-foreground">{value}</p>
    </div>
  )
}
