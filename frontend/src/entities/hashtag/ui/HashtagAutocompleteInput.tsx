import { Hash } from 'lucide-react'
import { useMemo } from 'react'

import { useHashtags } from '@/entities/hashtag/api/useHashtags'
import {
  getActiveHashtagQuery,
  insertHashtagSuggestion,
  parseHashtagInput,
} from '@/entities/hashtag/model/hashtagInput'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

type HashtagAutocompleteInputProps = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  placeholder?: string
}

export function HashtagAutocompleteInput({
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = 'seiko, diver, quartz',
}: HashtagAutocompleteInputProps) {
  const query = getActiveHashtagQuery(value)
  const selectedHashtags = useMemo(() => new Set(parseHashtagInput(value)), [value])
  const hashtagsQuery = useHashtags({
    query: query || undefined,
    size: 8,
    sort: 'name,asc',
  })
  const suggestions = (hashtagsQuery.data?.content ?? []).filter((hashtag) => !selectedHashtags.has(hashtag.name))

  function selectSuggestion(hashtag: string) {
    onChange(insertHashtagSuggestion(value, hashtag))
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Hash
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          autoComplete="off"
          className="pl-9"
          disabled={disabled}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type="text"
          value={value}
        />
      </div>

      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((hashtag) => (
            <Button
              key={hashtag.id}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectSuggestion(hashtag.name)}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Hash className="size-3.5" aria-hidden="true" />
              {hashtag.name}
            </Button>
          ))}
        </div>
      ) : null}

      {hashtagsQuery.isFetching && query ? (
        <p className="text-xs text-muted-foreground">Szukam hashtagów...</p>
      ) : null}
    </div>
  )
}
