import { httpClient } from '@/shared/api/httpClient'
import type { PageResponse } from '@/shared/api/page'
import type { MovementType, Watch } from '@/entities/watch/model/types'

export type WatchListParams = {
  brand?: string
  movementType?: MovementType
  minCaseDiameterMm?: number
  maxCaseDiameterMm?: number
  minWaterResistanceM?: number
  page?: number
  size?: number
  sort?: string
}

export function getWatches(params: WatchListParams = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return httpClient<PageResponse<Watch>>(`/api/watches${query ? `?${query}` : ''}`)
}
