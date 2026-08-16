import { RotateCcw, Search } from 'lucide-react'
import type { FormEvent } from 'react'

import {
  ARTICLE_PAGE_SIZES,
  ARTICLE_SORT_OPTIONS,
} from '@/features/article-list/model/articleListFilters'
import type { ArticleListFilters as ArticleListFiltersValue } from '@/features/article-list/model/articleListFilters'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'

type ArticleListFiltersProps = {
  value: ArticleListFiltersValue
  pageSize: number
  activeFiltersCount: number
  isFetching: boolean
  onApply: (filters: ArticleListFiltersValue, pageSize: number) => void
  onReset: () => void
}

export function ArticleListFilters({
  value,
  pageSize,
  activeFiltersCount,
  isFetching,
  onApply,
  onReset,
}: ArticleListFiltersProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    onApply(
      {
        query: String(formData.get('query') ?? '').trim(),
        sort: String(formData.get('sort') ?? value.sort) as ArticleListFiltersValue['sort'],
      },
      Number(formData.get('pageSize') ?? pageSize),
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Filtry artykułów</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeFiltersCount > 0 ? `${activeFiltersCount} aktywne` : 'Pełne archiwum'}
          </p>
        </div>
        <Badge variant={activeFiltersCount > 0 ? 'default' : 'secondary'}>
          {isFetching ? 'Odświeżanie' : 'Gotowe'}
        </Badge>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 lg:grid-cols-12" onSubmit={handleSubmit}>
          <label className="grid gap-2 lg:col-span-6">
            <span className="text-sm font-medium text-foreground">Szukaj</span>
            <Input
              autoComplete="off"
              defaultValue={value.query}
              name="query"
              placeholder="microbrand, diver, kolekcja..."
              type="search"
            />
          </label>

          <label className="grid gap-2 lg:col-span-3">
            <span className="text-sm font-medium text-foreground">Sortowanie</span>
            <Select defaultValue={value.sort} name="sort">
              {ARTICLE_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-2 lg:col-span-3">
            <span className="text-sm font-medium text-foreground">Na stronie</span>
            <Select defaultValue={pageSize} name="pageSize">
              {ARTICLE_PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </label>

          <div className="flex flex-col gap-2 sm:flex-row lg:col-span-12 lg:justify-end">
            <Button type="button" variant="outline" onClick={onReset}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Wyczyść
            </Button>
            <Button type="submit">
              <Search className="size-4" aria-hidden="true" />
              Zastosuj
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
