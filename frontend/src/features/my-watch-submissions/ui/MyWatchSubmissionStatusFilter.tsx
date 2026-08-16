import { WATCH_SUBMISSION_STATUS_LABELS } from '@/entities/watch/model/watchSubmissionStatus'
import type { MyWatchSubmissionStatusFilter as MyWatchSubmissionStatusFilterValue } from '@/features/my-watch-submissions/model/myWatchSubmissionFilters'
import { cn } from '@/shared/lib/utils'

type MyWatchSubmissionStatusFilterProps = {
  value: MyWatchSubmissionStatusFilterValue
  disabled?: boolean
  onChange: (value: MyWatchSubmissionStatusFilterValue) => void
}

const OPTIONS: Array<{ value: MyWatchSubmissionStatusFilterValue; label: string }> = [
  { value: 'ALL', label: 'Wszystkie' },
  { value: 'PENDING', label: WATCH_SUBMISSION_STATUS_LABELS.PENDING },
  { value: 'APPROVED', label: WATCH_SUBMISSION_STATUS_LABELS.APPROVED },
  { value: 'REJECTED', label: WATCH_SUBMISSION_STATUS_LABELS.REJECTED },
]

export function MyWatchSubmissionStatusFilter({
  value,
  disabled,
  onChange,
}: MyWatchSubmissionStatusFilterProps) {
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
