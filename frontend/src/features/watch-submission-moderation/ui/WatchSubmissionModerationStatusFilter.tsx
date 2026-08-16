import { WATCH_SUBMISSION_STATUS_LABELS } from '@/entities/watch/model/watchSubmissionStatus'
import type { WatchSubmissionModerationStatusFilter as WatchSubmissionModerationStatusFilterValue } from '@/features/watch-submission-moderation/model/watchSubmissionModerationFilters'
import { cn } from '@/shared/lib/utils'

type WatchSubmissionModerationStatusFilterProps = {
  value: WatchSubmissionModerationStatusFilterValue
  disabled?: boolean
  onChange: (value: WatchSubmissionModerationStatusFilterValue) => void
}

const OPTIONS: Array<{ value: WatchSubmissionModerationStatusFilterValue; label: string }> = [
  { value: 'PENDING', label: WATCH_SUBMISSION_STATUS_LABELS.PENDING },
  { value: 'APPROVED', label: WATCH_SUBMISSION_STATUS_LABELS.APPROVED },
  { value: 'REJECTED', label: WATCH_SUBMISSION_STATUS_LABELS.REJECTED },
  { value: 'ALL', label: 'Wszystkie' },
]

export function WatchSubmissionModerationStatusFilter({
  value,
  disabled,
  onChange,
}: WatchSubmissionModerationStatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Status zgłoszeń zegarków">
      {OPTIONS.map((option) => {
        const isActive = value === option.value

        return (
          <button
            className={cn(
              'h-9 rounded-md border border-input bg-card px-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-secondary-foreground disabled:pointer-events-none disabled:opacity-50',
              isActive && 'border-primary bg-secondary text-secondary-foreground',
            )}
            disabled={disabled}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
