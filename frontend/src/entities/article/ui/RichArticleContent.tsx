import { normalizeArticleContentForEditor } from '@/entities/article/model/articleContent'
import { cn } from '@/shared/lib/utils'

type RichArticleContentProps = {
  content: string
  className?: string
}

export function RichArticleContent({ content, className }: RichArticleContentProps) {
  return (
    <div
      className={cn('article-rich-content', className)}
      dangerouslySetInnerHTML={{ __html: normalizeArticleContentForEditor(content) }}
    />
  )
}
