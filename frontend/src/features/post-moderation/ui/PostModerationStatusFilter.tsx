import { POST_STATUS_LABELS } from '@/entities/post/model/postStatus'
import type { PostModerationStatusFilter as PostModerationStatusFilterValue } from '@/features/post-moderation/model/postModerationFilters'
import { StatusFilterGroup } from '@/shared/ui/status-filter-group'

type PostModerationStatusFilterProps = {
  value: PostModerationStatusFilterValue
  disabled?: boolean
  onChange: (value: PostModerationStatusFilterValue) => void
}

const OPTIONS: Array<{ value: PostModerationStatusFilterValue; label: string }> = [
  { value: 'PENDING', label: POST_STATUS_LABELS.PENDING },
  { value: 'APPROVED', label: POST_STATUS_LABELS.APPROVED },
  { value: 'REJECTED', label: POST_STATUS_LABELS.REJECTED },
  { value: 'ALL', label: 'Wszystkie' },
]

export function PostModerationStatusFilter({
  value,
  disabled,
  onChange,
}: PostModerationStatusFilterProps) {
  return (
    <StatusFilterGroup
      ariaLabel="Status postów w moderacji"
      disabled={disabled}
      onChange={onChange}
      options={OPTIONS}
      value={value}
    />
  )
}
