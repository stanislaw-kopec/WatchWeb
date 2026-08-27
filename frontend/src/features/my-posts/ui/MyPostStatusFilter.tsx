import { POST_STATUS_LABELS } from '@/entities/post/model/postStatus'
import type { MyPostStatusFilter as MyPostStatusFilterValue } from '@/features/my-posts/model/myPostListFilters'
import { StatusFilterGroup } from '@/shared/ui/status-filter-group'

type MyPostStatusFilterProps = {
  value: MyPostStatusFilterValue
  disabled?: boolean
  onChange: (value: MyPostStatusFilterValue) => void
}

const OPTIONS: Array<{ value: MyPostStatusFilterValue; label: string }> = [
  { value: 'ALL', label: 'Wszystkie' },
  { value: 'DRAFT', label: POST_STATUS_LABELS.DRAFT },
  { value: 'PENDING', label: POST_STATUS_LABELS.PENDING },
  { value: 'APPROVED', label: POST_STATUS_LABELS.APPROVED },
  { value: 'REJECTED', label: POST_STATUS_LABELS.REJECTED },
]

export function MyPostStatusFilter({ value, disabled, onChange }: MyPostStatusFilterProps) {
  return (
    <StatusFilterGroup
      ariaLabel="Status postów"
      disabled={disabled}
      onChange={onChange}
      options={OPTIONS}
      value={value}
    />
  )
}
