import type { WatchDetails } from '@/entities/watch/model/types'

export type WatchSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type ModerationWatchSubmission = {
  id: string
  brand: string
  model: string
  referenceCode: string | null
  details: WatchDetails | null
  status: WatchSubmissionStatus
  rejectionReason: string | null
  submittedById: string
  submittedByUsername: string
  createdAt: string
  updatedAt: string
}

export type WatchSubmissionResponse = {
  id: string
  brand: string
  model: string
  referenceCode: string | null
  details: WatchDetails | null
  status: WatchSubmissionStatus
  message: string
  createdAt: string
}
