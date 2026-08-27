import { WATCH_SUBMISSION_STATUS_LABELS } from '@/entities/watch/model/watchSubmissionStatus'
import type { MyWatchSubmissionStatusFilter as MyWatchSubmissionStatusFilterValue } from '@/features/my-watch-submissions/model/myWatchSubmissionFilters'
import { StatusFilterGroup } from '@/shared/ui/status-filter-group'

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
    <StatusFilterGroup
      ariaLabel="Status zgłoszeń zegarków"
      disabled={disabled}
      onChange={onChange}
      options={OPTIONS}
      value={value}
    />
  )
}
