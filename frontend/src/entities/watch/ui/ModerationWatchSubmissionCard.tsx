import type { ReactNode } from 'react'
import { CalendarDays, Gauge, Ruler, UserRound, Watch, Waves } from 'lucide-react'

import { formatMovementType } from '@/entities/watch/model/movementType'
import type { ModerationWatchSubmission } from '@/entities/watch/model/submissionTypes'
import type { WatchDetails } from '@/entities/watch/model/types'
import { WatchSubmissionStatusBadge } from '@/entities/watch/ui/WatchSubmissionStatusBadge'
import { formatDateTime } from '@/shared/lib/date'
import { Card, CardContent } from '@/shared/ui/card'

type ModerationWatchSubmissionCardProps = {
  submission: ModerationWatchSubmission
  actions?: ReactNode
}

export function ModerationWatchSubmissionCard({
  submission,
  actions,
}: ModerationWatchSubmissionCardProps) {
  return (
    <Card>
      <CardContent className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <WatchSubmissionStatusBadge status={submission.status} />
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {formatDateTime(submission.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <UserRound className="size-3.5" aria-hidden="true" />
              {submission.submittedByUsername}
            </span>
          </div>

          <div className="mt-4 min-w-0">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {submission.brand}
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-foreground">
              {submission.model}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Referencja: {submission.referenceCode || 'Brak danych'}
            </p>
          </div>

          {submission.status === 'REJECTED' && submission.rejectionReason ? (
            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {submission.rejectionReason}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <TechnicalDetails details={submission.details} />
          {actions ? <div className="border-t border-border pt-4">{actions}</div> : null}
        </div>
      </CardContent>
    </Card>
  )
}

function TechnicalDetails({ details }: { details: WatchDetails | null }) {
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
