import { Hash } from 'lucide-react'
import { Link } from 'react-router'

import { cn } from '@/shared/lib/utils'

type HashtagLinkListProps = {
  hashtags: string[]
  className?: string
}

export function HashtagLinkList({ hashtags, className }: HashtagLinkListProps) {
  if (hashtags.length === 0) {
    return null
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {hashtags.map((hashtag) => (
        <Link
          aria-label={`Filtruj posty po hashtagu ${hashtag}`}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground transition hover:border-primary/40 hover:text-primary"
          key={hashtag}
          to={`/posts?hashtag=${encodeURIComponent(hashtag)}`}
        >
          <Hash className="size-3" aria-hidden="true" />
          {hashtag}
        </Link>
      ))}
    </div>
  )
}
