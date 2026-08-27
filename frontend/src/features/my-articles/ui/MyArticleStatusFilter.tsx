import { ARTICLE_STATUS_LABELS } from '@/entities/article/model/articleStatus'
import type { MyArticleStatusFilter as MyArticleStatusFilterValue } from '@/features/my-articles/model/myArticleListFilters'
import { cn } from '@/shared/lib/utils'

type MyArticleStatusFilterProps = {
  value: MyArticleStatusFilterValue
  disabled?: boolean
  onChange: (value: MyArticleStatusFilterValue) => void
}

const OPTIONS: Array<{ value: MyArticleStatusFilterValue; label: string }> = [
  { value: 'ALL', label: 'Wszystkie' },
  { value: 'DRAFT', label: ARTICLE_STATUS_LABELS.DRAFT },
  { value: 'PUBLISHED', label: ARTICLE_STATUS_LABELS.PUBLISHED },
]

export function MyArticleStatusFilter({ value, disabled, onChange }: MyArticleStatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Status artykułów">
      {OPTIONS.map((option) => (
        <button
          className={cn(
            'h-9 rounded-md border border-input bg-card px-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-secondary-foreground disabled:pointer-events-none disabled:opacity-50',
            value === option.value && 'border-primary bg-secondary text-secondary-foreground',
          )}
          disabled={disabled}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
