import { ArrowRight, CalendarDays, MessageSquareText } from 'lucide-react'
import { Link } from 'react-router'

import { HashtagLinkList } from '@/entities/hashtag/ui/HashtagLinkList'
import { postContentToText } from '@/entities/post/model/postContent'
import type { Post } from '@/entities/post/model/types'
import { UserProfileLink } from '@/entities/user/ui/UserProfileLink'
import { formatDateTime } from '@/shared/lib/date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

type PostCardProps = {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <PostVisual post={post} />

        <CardContent className="flex min-w-0 flex-col gap-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Post</Badge>
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
            <h3 className="line-clamp-2 text-xl font-semibold tracking-normal text-foreground">
              <Link className="hover:text-primary" to={`/posts/${post.id}`}>
                {post.title}
              </Link>
            </h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {postContentToText(post.content)}
            </p>
          </div>

          {post.hashtags.length > 0 ? (
            <HashtagLinkList hashtags={post.hashtags} />
          ) : null}

          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{formatPostLength(postContentToText(post.content))}</p>
            <Button asChild variant="outline">
              <Link to={`/posts/${post.id}`}>
                Szczegóły
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
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
        className="h-56 w-full bg-secondary/45 object-contain lg:h-full"
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

function formatPostLength(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length

  return `${words} słów`
}
