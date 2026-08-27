import type { ReactNode } from 'react'
import { ArrowRight, CalendarDays, MessageSquareText } from 'lucide-react'
import { Link } from 'react-router'

import { HashtagLinkList } from '@/entities/hashtag/ui/HashtagLinkList'
import { postContentToText } from '@/entities/post/model/postContent'
import type { Post } from '@/entities/post/model/types'
import { PostStatusBadge } from '@/entities/post/ui/PostStatusBadge'
import { UserProfileLink } from '@/entities/user/ui/UserProfileLink'
import { formatDateTime } from '@/shared/lib/date'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

type ModerationPostCardProps = {
  post: Post
  actions?: ReactNode
}

export function ModerationPostCard({ post, actions }: ModerationPostCardProps) {
  const plainContent = postContentToText(post.content)

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 xl:grid-cols-[260px_1fr]">
        <PostVisual post={post} />

        <CardContent className="flex min-w-0 flex-col gap-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <PostStatusBadge status={post.status} />
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {formatDateTime(post.createdAt)}
            </span>
            <UserProfileLink
              className="text-xs text-muted-foreground"
              userId={post.authorId}
              username={post.authorUsername}
              withIcon
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-normal text-foreground">
              {post.title}
            </h2>
            <div className="mt-3 max-h-56 overflow-y-auto rounded-md border border-border bg-secondary/35 p-3 text-sm leading-6 text-muted-foreground">
              {getParagraphs(plainContent).map((paragraph, index) => (
                <p className={index > 0 ? 'mt-3' : undefined} key={index}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {post.hashtags.length > 0 ? (
            <HashtagLinkList hashtags={post.hashtags} />
          ) : null}

          {post.status === 'REJECTED' && post.rejectionReason ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {post.rejectionReason}
            </div>
          ) : null}

          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{formatPostLength(plainContent)}</p>
            {post.status === 'APPROVED' ? (
              <Button asChild variant="outline">
                <Link to={`/posts/${post.id}`}>
                  Zobacz publicznie
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
          </div>

          {actions ? <div className="border-t border-border pt-4">{actions}</div> : null}
        </CardContent>
      </div>
    </Card>
  )
}

function PostVisual({ post }: { post: Post }) {
  if (post.imageUrl) {
    return (
      <img
        alt=""
        className="h-56 w-full bg-secondary/45 object-contain xl:h-full"
        src={post.imageUrl}
      />
    )
  }

  return (
    <div className="flex min-h-56 items-center justify-center bg-secondary text-primary">
      <MessageSquareText className="size-14" aria-hidden="true" />
    </div>
  )
}

function getParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function formatPostLength(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length

  return `${words} słów`
}
