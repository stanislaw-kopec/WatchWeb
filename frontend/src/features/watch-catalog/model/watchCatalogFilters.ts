import type { WatchListParams } from '@/entities/watch/api/watchApi'
import type { MovementType } from '@/entities/watch/model/types'
import { MOVEMENT_TYPE_OPTIONS } from '@/entities/watch/model/movementType'

export type WatchCatalogSort = 'createdAt,desc' | 'brand,asc' | 'averageRating,desc' | 'reviewsCount,desc'

export type WatchCatalogFilters = {
  brand: string
  movementType: MovementType | ''
  minCaseDiameterMm: string
  maxCaseDiameterMm: string
  minWaterResistanceM: string
  sort: WatchCatalogSort
}

export type WatchCatalogSearchState = WatchCatalogFilters & {
  page: number
  size: number
}

export const DEFAULT_WATCH_CATALOG_PAGE_SIZE = 12

export const WATCH_CATALOG_PAGE_SIZES = [12, 24, 48] as const

export const WATCH_CATALOG_SORT_OPTIONS: Array<{ value: WatchCatalogSort; label: string }> = [
  { value: 'createdAt,desc', label: 'Najnowsze' },
  { value: 'brand,asc', label: 'Marka A-Z' },
  { value: 'averageRating,desc', label: 'Najwyżej oceniane' },
  { value: 'reviewsCount,desc', label: 'Najwięcej recenzji' },
]

export const DEFAULT_WATCH_CATALOG_FILTERS: WatchCatalogFilters = {
  brand: '',
  movementType: '',
  minCaseDiameterMm: '',
  maxCaseDiameterMm: '',
  minWaterResistanceM: '',
  sort: 'createdAt,desc',
}

const movementTypeValues = MOVEMENT_TYPE_OPTIONS.map((option) => option.value)
const sortValues = WATCH_CATALOG_SORT_OPTIONS.map((option) => option.value)

export function parseWatchCatalogSearchParams(searchParams: URLSearchParams): WatchCatalogSearchState {
  const movementType = searchParams.get('movementType')
  const sort = searchParams.get('sort')

  return {
    ...DEFAULT_WATCH_CATALOG_FILTERS,
    brand: searchParams.get('brand') ?? '',
    movementType: isMovementType(movementType) ? movementType : '',
    minCaseDiameterMm: cleanDecimalParam(searchParams.get('minCaseDiameterMm')),
    maxCaseDiameterMm: cleanDecimalParam(searchParams.get('maxCaseDiameterMm')),
    minWaterResistanceM: cleanIntegerParam(searchParams.get('minWaterResistanceM')),
    sort: isWatchCatalogSort(sort) ? sort : DEFAULT_WATCH_CATALOG_FILTERS.sort,
    page: parsePositiveInteger(searchParams.get('page'), 0),
    size: parsePageSize(searchParams.get('size')),
  }
}

export function toWatchListParams(state: WatchCatalogSearchState): WatchListParams {
  return {
    brand: state.brand.trim() || undefined,
    movementType: state.movementType || undefined,
    minCaseDiameterMm: toNumber(state.minCaseDiameterMm),
    maxCaseDiameterMm: toNumber(state.maxCaseDiameterMm),
    minWaterResistanceM: toNumber(state.minWaterResistanceM),
    page: state.page,
    size: state.size,
    sort: state.sort,
  }
}

export function buildWatchCatalogSearchParams(
  filters: WatchCatalogFilters,
  page: number,
  size: number,
) {
  const params = new URLSearchParams()
  const normalizedBrand = filters.brand.trim()

  if (normalizedBrand) {
    params.set('brand', normalizedBrand)
  }
  if (filters.movementType) {
    params.set('movementType', filters.movementType)
  }
  if (filters.minCaseDiameterMm) {
    params.set('minCaseDiameterMm', filters.minCaseDiameterMm)
  }
  if (filters.maxCaseDiameterMm) {
    params.set('maxCaseDiameterMm', filters.maxCaseDiameterMm)
  }
  if (filters.minWaterResistanceM) {
    params.set('minWaterResistanceM', filters.minWaterResistanceM)
  }
  if (filters.sort !== DEFAULT_WATCH_CATALOG_FILTERS.sort) {
    params.set('sort', filters.sort)
  }
  if (page > 0) {
    params.set('page', String(page))
  }
  if (size !== DEFAULT_WATCH_CATALOG_PAGE_SIZE) {
    params.set('size', String(size))
  }

  return params
}

export function countActiveWatchCatalogFilters(filters: WatchCatalogFilters) {
  return [
    filters.brand,
    filters.movementType,
    filters.minCaseDiameterMm,
    filters.maxCaseDiameterMm,
    filters.minWaterResistanceM,
  ].filter(Boolean).length
}

function isMovementType(value: string | null): value is MovementType {
  return movementTypeValues.includes(value as MovementType)
}

function isWatchCatalogSort(value: string | null): value is WatchCatalogSort {
  return sortValues.includes(value as WatchCatalogSort)
}

function parsePageSize(value: string | null) {
  const size = parsePositiveInteger(value, DEFAULT_WATCH_CATALOG_PAGE_SIZE)

  return WATCH_CATALOG_PAGE_SIZES.includes(size as (typeof WATCH_CATALOG_PAGE_SIZES)[number])
    ? size
    : DEFAULT_WATCH_CATALOG_PAGE_SIZE
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}

function cleanDecimalParam(value: string | null) {
  return value && Number(value) >= 0 ? value : ''
}

function cleanIntegerParam(value: string | null) {
  return value && Number.isInteger(Number(value)) && Number(value) >= 0 ? value : ''
}

function toNumber(value: string) {
  return value ? Number(value) : undefined
}
