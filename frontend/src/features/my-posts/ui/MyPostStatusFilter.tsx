import { POST_STATUS_LABELS } from '@/entities/post/model/postStatus'
import type { MyPostStatusFilter as MyPostStatusFilterValue } from '@/features/my-posts/model/myPostListFilters'
import { cn } from '@/shared/lib/utils'

type MyPostStatusFilterProps = {
  value: MyPostStatusFilterValue
  disabled?: boolean
  onChange: (value: MyPostStatusFilterValue) => void
}

const OPTIONS: Array<{ value: MyPostStatusFilterValue; label: string }> = [
  { value: 'ALL', label: 'Wszystkie' },
  { value: 'PENDING', label: POST_STATUS_LABELS.PENDING },
  { value: 'APPROVED', label: POST_STATUS_LABELS.APPROVED },
  { value: 'REJECTED', label: POST_STATUS_LABELS.REJECTED },
]

export function MyPostStatusFilter({ value, disabled, onChange }: MyPostStatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Status postów">
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
