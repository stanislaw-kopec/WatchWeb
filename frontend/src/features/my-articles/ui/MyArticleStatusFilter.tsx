import { ARTICLE_STATUS_LABELS } from '@/entities/article/model/articleStatus'
import type { MyArticleStatusFilter as MyArticleStatusFilterValue } from '@/features/my-articles/model/myArticleListFilters'
import { StatusFilterGroup } from '@/shared/ui/status-filter-group'

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
    <StatusFilterGroup
      ariaLabel="Status artykułów"
      disabled={disabled}
      onChange={onChange}
      options={OPTIONS}
      value={value}
    />
  )
}
