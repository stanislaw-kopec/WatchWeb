import { POST_STATUS_LABELS } from '@/entities/post/model/postStatus'
import type { PostModerationStatusFilter as PostModerationStatusFilterValue } from '@/features/post-moderation/model/postModerationFilters'
import { cn } from '@/shared/lib/utils'

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
    <div className="flex flex-wrap gap-2" role="group" aria-label="Status postów w moderacji">
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
