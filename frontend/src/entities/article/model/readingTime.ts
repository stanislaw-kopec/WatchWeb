export function estimateReadingTime(content: string) {
  const words = countWords(content)
  const minutes = Math.max(1, Math.ceil(words / 220))

  return `${minutes} min czytania`
}

export function countWords(content: string) {
  return content.trim().split(/\s+/).filter(Boolean).length
}
