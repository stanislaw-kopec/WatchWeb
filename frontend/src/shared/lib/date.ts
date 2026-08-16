const POLISH_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDateTime(value: string) {
  return POLISH_DATE_TIME_FORMATTER.format(new Date(value))
}
