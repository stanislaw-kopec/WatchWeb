import { Gauge, Ruler, Watch, Waves } from 'lucide-react'

import { formatMovementType } from '@/entities/watch/model/movementType'
import type { WatchDetails } from '@/entities/watch/model/types'

type WatchTechnicalDetailsGridProps = {
  details: WatchDetails | null
}

export function WatchTechnicalDetailsGrid({ details }: WatchTechnicalDetailsGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <TechnicalFact icon={Gauge} label="Mechanizm" value={formatMovementType(details?.movementType)} />
      <TechnicalFact label="Kaliber" value={details?.caliber ?? 'Brak danych'} />
      <TechnicalFact icon={Ruler} label="Średnica" value={formatMillimeters(details?.caseDiameterMm)} />
      <TechnicalFact label="Grubość" value={formatMillimeters(details?.caseThicknessMm)} />
      <TechnicalFact label="Lug to lug" value={formatMillimeters(details?.lugToLugMm)} />
      <TechnicalFact label="Szerokość paska" value={formatMillimeters(details?.strapWidthMm)} />
      <TechnicalFact icon={Waves} label="Wodoszczelność" value={formatWaterResistance(details)} />
      <TechnicalFact label="Szkło" value={details?.crystalType ?? 'Brak danych'} />
      <TechnicalFact icon={Watch} label="Materiał" value={details?.caseMaterial ?? 'Brak danych'} />
    </div>
  )
}

type TechnicalFactProps = {
  label: string
  value: string
  icon?: typeof Gauge
}

function TechnicalFact({ label, value, icon: Icon }: TechnicalFactProps) {
  return (
    <div className="rounded-md border border-border bg-secondary/45 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
        <p>{label}</p>
      </div>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  )
}

function formatMillimeters(value: number | null | undefined) {
  return value ? `${value} mm` : 'Brak danych'
}

function formatWaterResistance(details: WatchDetails | null | undefined) {
  return details?.waterResistanceM ? `${details.waterResistanceM} m` : 'Brak danych'
}
