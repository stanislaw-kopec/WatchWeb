import type { WatchSubmissionStatus } from '@/entities/watch/model/submissionTypes'

export const WATCH_SUBMISSION_STATUS_LABELS: Record<WatchSubmissionStatus, string> = {
  PENDING: 'Oczekuje',
  APPROVED: 'Zaakceptowane',
  REJECTED: 'Odrzucone',
}

export const WATCH_SUBMISSION_STATUS_DESCRIPTIONS: Record<WatchSubmissionStatus, string> = {
  PENDING: 'Zgłoszenie czeka na decyzję moderatora.',
  APPROVED: 'Zgłoszenie utworzyło wpis w katalogu.',
  REJECTED: 'Zgłoszenie wymaga poprawek albo zostało odrzucone.',
}
