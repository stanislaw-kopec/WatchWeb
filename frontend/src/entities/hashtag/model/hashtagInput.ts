export function normalizeHashtagName(value: string) {
  return value
    .trim()
    .replace(/^#+/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export function parseHashtagInput(value: string) {
  const seen = new Set<string>()

  return value
    .split(/[\s,;]+/)
    .map(normalizeHashtagName)
    .filter((hashtag) => {
      if (!hashtag || seen.has(hashtag)) {
        return false
      }

      seen.add(hashtag)
      return true
    })
}

export function formatHashtagInput(hashtags: string[]) {
  return hashtags.join(', ')
}

export function getActiveHashtagQuery(value: string) {
  return normalizeHashtagName(value.slice(getCurrentTokenStart(value)))
}

export function insertHashtagSuggestion(value: string, suggestion: string) {
  const normalizedSuggestion = normalizeHashtagName(suggestion)

  if (!normalizedSuggestion) {
    return value
  }

  const tokensBeforeCurrent = parseHashtagInput(value.slice(0, getCurrentTokenStart(value)))
  const nextTokens = [...tokensBeforeCurrent, normalizedSuggestion]

  return `${formatHashtagInput(dedupe(nextTokens))}, `
}

function getCurrentTokenStart(value: string) {
  for (let index = value.length - 1; index >= 0; index -= 1) {
    if (/[\s,;]/.test(value[index])) {
      return index + 1
    }
  }

  return 0
}

function dedupe(values: string[]) {
  return Array.from(new Set(values))
}
