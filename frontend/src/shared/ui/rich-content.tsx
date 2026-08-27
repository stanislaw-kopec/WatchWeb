import { normalizeRichContentForEditor } from '@/shared/lib/richContent'
import { cn } from '@/shared/lib/utils'

type RichContentProps = {
  content: string
  className?: string
}

export function RichContent({ content, className }: RichContentProps) {
  return (
    <div
      className={cn('rich-content', className)}
      dangerouslySetInnerHTML={{ __html: normalizeRichContentForEditor(content) }}
    />
  )
}
