import { parseHashtagInput } from '@/entities/hashtag/model/hashtagInput'

export function parsePostHashtags(value: string) {
  return parseHashtagInput(value)
}
