import { RotateCcw, Search } from 'lucide-react'
import type { FormEvent } from 'react'

import { MOVEMENT_TYPE_OPTIONS } from '@/entities/watch/model/movementType'
import {
  WATCH_CATALOG_PAGE_SIZES,
  WATCH_CATALOG_SORT_OPTIONS,
} from '@/features/watch-catalog/model/watchCatalogFilters'
import type { WatchCatalogFilters as WatchCatalogFiltersValue } from '@/features/watch-catalog/model/watchCatalogFilters'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'

type WatchCatalogFiltersProps = {
  value: WatchCatalogFiltersValue
  pageSize: number
  activeFiltersCount: number
  isFetching: boolean
  onApply: (filters: WatchCatalogFiltersValue, pageSize: number) => void
  onReset: () => void
}

export function WatchCatalogFilters({
  value,
  pageSize,
  activeFiltersCount,
  isFetching,
  onApply,
  onReset,
}: WatchCatalogFiltersProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    onApply(
      {
        brand: String(formData.get('brand') ?? '').trim(),
        movementType: String(formData.get('movementType') ?? '') as WatchCatalogFiltersValue['movementType'],
        minCaseDiameterMm: String(formData.get('minCaseDiameterMm') ?? ''),
        maxCaseDiameterMm: String(formData.get('maxCaseDiameterMm') ?? ''),
        minWaterResistanceM: String(formData.get('minWaterResistanceM') ?? ''),
        sort: String(formData.get('sort') ?? value.sort) as WatchCatalogFiltersValue['sort'],
      },
      Number(formData.get('pageSize') ?? pageSize),
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle>Filtry katalogu</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeFiltersCount > 0 ? `${activeFiltersCount} aktywne` : 'Pełny katalog'}
          </p>
        </div>
        <Badge variant={activeFiltersCount > 0 ? 'default' : 'secondary'}>
          {isFetching ? 'Odświeżanie' : 'Gotowe'}
        </Badge>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 lg:grid-cols-12" onSubmit={handleSubmit}>
          <label className="grid gap-2 lg:col-span-3">
            <span className="text-sm font-medium text-foreground">Marka</span>
            <Input
              autoComplete="off"
              defaultValue={value.brand}
              name="brand"
              placeholder="Seiko"
            />
          </label>

          <label className="grid gap-2 lg:col-span-3">
            <span className="text-sm font-medium text-foreground">Mechanizm</span>
            <Select
              defaultValue={value.movementType}
              name="movementType"
            >
              <option value="">Wszystkie</option>
              {MOVEMENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-2 lg:col-span-2">
            <span className="text-sm font-medium text-foreground">Średnica od</span>
            <Input
              defaultValue={value.minCaseDiameterMm}
              min="0"
              name="minCaseDiameterMm"
              step="0.1"
              type="number"
            />
          </label>

          <label className="grid gap-2 lg:col-span-2">
            <span className="text-sm font-medium text-foreground">Średnica do</span>
            <Input
              defaultValue={value.maxCaseDiameterMm}
              min="0"
              name="maxCaseDiameterMm"
              step="0.1"
              type="number"
            />
          </label>

          <label className="grid gap-2 lg:col-span-2">
            <span className="text-sm font-medium text-foreground">WR od</span>
            <Input
              defaultValue={value.minWaterResistanceM}
              min="0"
              name="minWaterResistanceM"
              step="1"
              type="number"
            />
          </label>

          <label className="grid gap-2 lg:col-span-4">
            <span className="text-sm font-medium text-foreground">Sortowanie</span>
            <Select
              defaultValue={value.sort}
              name="sort"
            >
              {WATCH_CATALOG_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-2 lg:col-span-2">
            <span className="text-sm font-medium text-foreground">Na stronie</span>
            <Select
              defaultValue={pageSize}
              name="pageSize"
            >
              {WATCH_CATALOG_PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </label>

          <div className="flex flex-col gap-2 sm:flex-row lg:col-span-6 lg:items-end lg:justify-end">
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
