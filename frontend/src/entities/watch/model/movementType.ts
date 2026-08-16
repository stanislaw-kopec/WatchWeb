import type { MovementType } from '@/entities/watch/model/types'

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  AUTOMATIC: 'Automatyczny',
  QUARTZ: 'Kwarcowy',
  MANUAL: 'Manualny',
  SOLAR: 'Solarny',
  SPRING_DRIVE: 'Spring Drive',
  OTHER: 'Inny',
}

export const MOVEMENT_TYPE_OPTIONS = Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => ({
  value: value as MovementType,
  label,
}))

export function formatMovementType(movementType: MovementType | null | undefined) {
  return movementType ? MOVEMENT_TYPE_LABELS[movementType] : 'Brak danych'
}
