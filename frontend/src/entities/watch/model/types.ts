export type MovementType = 'AUTOMATIC' | 'QUARTZ' | 'MANUAL' | 'SOLAR' | 'SPRING_DRIVE' | 'OTHER'

export type WatchDetails = {
  movementType: MovementType | null
  caliber: string | null
  caseDiameterMm: number | null
  caseThicknessMm: number | null
  lugToLugMm: number | null
  strapWidthMm: number | null
  waterResistanceM: number | null
  crystalType: string | null
  caseMaterial: string | null
}

export type Watch = {
  id: string
  brand: string
  model: string
  referenceCode: string
  details: WatchDetails | null
  averageRating: number
  reviewsCount: number
  createdAt: string
}
