import { z } from 'zod'

import type {
  CreateWatchSubmissionRequest,
  WatchDetailsSubmissionRequest,
} from '@/entities/watch/api/watchSubmissionApi'
import type { MovementType } from '@/entities/watch/model/types'

export const WATCH_SUBMISSION_BRAND_MAX_LENGTH = 100
export const WATCH_SUBMISSION_MODEL_MAX_LENGTH = 150
export const WATCH_SUBMISSION_REFERENCE_MAX_LENGTH = 100
export const WATCH_SUBMISSION_DETAIL_TEXT_MAX_LENGTH = 100

const MOVEMENT_TYPE_VALUES = [
  'AUTOMATIC',
  'QUARTZ',
  'MANUAL',
  'SOLAR',
  'SPRING_DRIVE',
  'OTHER',
] as const

const optionalText = (maxLength: number) =>
  z.string().trim().max(maxLength, `Maksymalnie ${maxLength} znaków.`)

const optionalDecimalText = (label: string) =>
  z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^\d+([,.]\d+)?$/.test(value),
      `${label} musi być liczbą większą lub równą 0.`,
    )

const optionalIntegerText = (label: string) =>
  z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^\d+$/.test(value),
      `${label} musi być liczbą całkowitą większą lub równą 0.`,
    )

export const watchSubmissionFormSchema = z.object({
  brand: z
    .string()
    .trim()
    .min(1, 'Wpisz markę.')
    .max(WATCH_SUBMISSION_BRAND_MAX_LENGTH, `Marka może mieć maksymalnie ${WATCH_SUBMISSION_BRAND_MAX_LENGTH} znaków.`),
  model: z
    .string()
    .trim()
    .min(1, 'Wpisz model.')
    .max(WATCH_SUBMISSION_MODEL_MAX_LENGTH, `Model może mieć maksymalnie ${WATCH_SUBMISSION_MODEL_MAX_LENGTH} znaków.`),
  referenceCode: optionalText(WATCH_SUBMISSION_REFERENCE_MAX_LENGTH),
  movementType: z.union([z.literal(''), z.enum(MOVEMENT_TYPE_VALUES)]),
  caliber: optionalText(WATCH_SUBMISSION_DETAIL_TEXT_MAX_LENGTH),
  caseDiameterMm: optionalDecimalText('Średnica'),
  caseThicknessMm: optionalDecimalText('Grubość'),
  lugToLugMm: optionalDecimalText('Lug to lug'),
  strapWidthMm: optionalDecimalText('Szerokość paska'),
  waterResistanceM: optionalIntegerText('Wodoszczelność'),
  crystalType: optionalText(WATCH_SUBMISSION_DETAIL_TEXT_MAX_LENGTH),
  caseMaterial: optionalText(WATCH_SUBMISSION_DETAIL_TEXT_MAX_LENGTH),
})

export type WatchSubmissionFormValues = z.infer<typeof watchSubmissionFormSchema>

export function getDefaultWatchSubmissionFormValues(): WatchSubmissionFormValues {
  return {
    brand: '',
    model: '',
    referenceCode: '',
    movementType: '',
    caliber: '',
    caseDiameterMm: '',
    caseThicknessMm: '',
    lugToLugMm: '',
    strapWidthMm: '',
    waterResistanceM: '',
    crystalType: '',
    caseMaterial: '',
  }
}

export function createWatchSubmissionRequestFromForm(
  values: WatchSubmissionFormValues,
): CreateWatchSubmissionRequest {
  const details: WatchDetailsSubmissionRequest = {
    movementType: values.movementType === '' ? null : (values.movementType as MovementType),
    caliber: textOrNull(values.caliber),
    caseDiameterMm: decimalOrNull(values.caseDiameterMm),
    caseThicknessMm: decimalOrNull(values.caseThicknessMm),
    lugToLugMm: decimalOrNull(values.lugToLugMm),
    strapWidthMm: decimalOrNull(values.strapWidthMm),
    waterResistanceM: integerOrNull(values.waterResistanceM),
    crystalType: textOrNull(values.crystalType),
    caseMaterial: textOrNull(values.caseMaterial),
  }

  return {
    brand: values.brand.trim(),
    model: values.model.trim(),
    referenceCode: textOrNull(values.referenceCode),
    details: hasDetails(details) ? details : null,
  }
}

function textOrNull(value: string) {
  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : null
}

function decimalOrNull(value: string) {
  const normalized = value.trim().replace(',', '.')

  return normalized.length > 0 ? Number(normalized) : null
}

function integerOrNull(value: string) {
  const trimmed = value.trim()

  return trimmed.length > 0 ? Number(trimmed) : null
}

function hasDetails(details: WatchDetailsSubmissionRequest) {
  return Object.values(details).some((value) => value !== null)
}
