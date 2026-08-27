import { WATCH_SUBMISSION_STATUS_LABELS } from '@/entities/watch/model/watchSubmissionStatus'
import type { WatchSubmissionModerationStatusFilter as WatchSubmissionModerationStatusFilterValue } from '@/features/watch-submission-moderation/model/watchSubmissionModerationFilters'
import { StatusFilterGroup } from '@/shared/ui/status-filter-group'

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
    <StatusFilterGroup
      ariaLabel="Status zgłoszeń zegarków"
      disabled={disabled}
      onChange={onChange}
      options={OPTIONS}
      value={value}
    />
  )
}
