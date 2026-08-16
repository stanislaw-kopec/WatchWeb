export function parsePostHashtags(value: string) {
  const seen = new Set<string>()

  return value
    .split(/[\s,;]+/)
    .map(normalizePostHashtag)
    .filter((hashtag) => {
      if (!hashtag || seen.has(hashtag)) {
        return false
      }

      seen.add(hashtag)
      return true
    })
}

function normalizePostHashtag(value: string) {
  return value
    .trim()
    .replace(/^#+/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}
