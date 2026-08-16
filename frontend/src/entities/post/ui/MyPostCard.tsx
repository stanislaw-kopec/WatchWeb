import type { ReactNode } from 'react'
import { ArrowRight, CalendarDays, Hash, MessageSquareText } from 'lucide-react'
import { Link } from 'react-router'

import { POST_STATUS_DESCRIPTIONS } from '@/entities/post/model/postStatus'
import type { Post } from '@/entities/post/model/types'
import { PostStatusBadge } from '@/entities/post/ui/PostStatusBadge'
import { formatDateTime } from '@/shared/lib/date'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

type MyPostCardProps = {
  post: Post
  actions?: ReactNode
}

export function MyPostCard({ post, actions }: MyPostCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[240px_1fr]">
        <PostVisual post={post} />

        <CardContent className="flex min-w-0 flex-col gap-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <PostStatusBadge status={post.status} />
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {formatDateTime(post.createdAt)}
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="line-clamp-2 text-xl font-semibold tracking-normal text-foreground">
              {post.status === 'APPROVED' ? (
                <Link className="hover:text-primary" to={`/posts/${post.id}`}>
                  {post.title}
                </Link>
              ) : (
                post.title
              )}
            </h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {post.content}
            </p>
          </div>

          {post.hashtags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {post.hashtags.map((hashtag) => (
                <span
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
                  key={hashtag}
                >
                  <Hash className="size-3" aria-hidden="true" />
                  {hashtag}
                </span>
              ))}
            </div>
          ) : null}

          {post.status === 'REJECTED' && post.rejectionReason ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {post.rejectionReason}
            </div>
          ) : null}

          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{POST_STATUS_DESCRIPTIONS[post.status]}</p>
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
        className="h-48 w-full object-cover lg:h-full"
        src={post.imageUrl}
      />
    )
  }

  return (
    <div className="flex min-h-48 items-center justify-center bg-secondary text-primary">
      <MessageSquareText className="size-12" aria-hidden="true" />
    </div>
  )
}
