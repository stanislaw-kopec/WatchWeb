import {
  ArrowLeft,
  CalendarDays,
  FileText,
  MessageCircle,
  MessageSquareText,
  UserRound,
} from 'lucide-react'
import { Link, useParams } from 'react-router'

import { usePostComments } from '@/entities/comment/api/usePostComments'
import type { PostComment } from '@/entities/comment/model/types'
import { HashtagLinkList } from '@/entities/hashtag/ui/HashtagLinkList'
import { usePost } from '@/entities/post/api/usePosts'
import { postContentToText } from '@/entities/post/model/postContent'
import type { Post } from '@/entities/post/model/types'
import { UserProfileLink } from '@/entities/user/ui/UserProfileLink'
import { PostCommentSection } from '@/features/comment-create/ui/PostCommentSection'
import { formatDateTime } from '@/shared/lib/date'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ErrorState } from '@/shared/ui/error-state'
import { MetricCard } from '@/shared/ui/metric-card'
import { RichContent } from '@/shared/ui/rich-content'
import { Skeleton } from '@/shared/ui/skeleton'

export function PostDetailsPage() {
  const { postId } = useParams()
  const postQuery = usePost(postId)
  const commentsQuery = usePostComments(postId)

  if (postQuery.isLoading) {
    return <PostDetailsSkeleton />
  }

  if (postQuery.isError || !postQuery.data) {
    return (
      <ErrorState
        description="Sprawdź, czy wybrany wpis nadal jest dostępny publicznie."
        isRetrying={postQuery.isFetching}
        onRetry={() => void postQuery.refetch()}
        title="Nie udało się pobrać posta"
      />
    )
  }

  const post = postQuery.data
  const comments = commentsQuery.data ?? []
  const commentsCount = countComments(comments)

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link to="/posts">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Wróć do postów
        </Link>
      </Button>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="p-6 md:p-8">
            <Badge variant="secondary">Post społeczności</Badge>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <UserProfileLink
                className="text-muted-foreground"
                userId={post.authorId}
                username={post.authorUsername}
                withIcon
              />
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-4" aria-hidden="true" />
                {formatDateTime(post.createdAt)}
              </span>
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-normal text-foreground md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
              {getLead(post.content)}
            </p>
          </div>

          <PostHeroVisual post={post} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <RichContent className="text-base leading-8 text-foreground" content={post.content} />
        </article>

        <aside className="space-y-4">
          <MetricCard icon={UserRound} label="Autor" value={post.authorUsername} valueClassName="text-xl" />
          <MetricCard icon={CalendarDays} label="Dodano" value={formatDateTime(post.createdAt)} valueClassName="text-xl" />
          <MetricCard icon={FileText} label="Liczba słów" value={String(countWords(post.content))} valueClassName="text-xl" />
          <MetricCard icon={MessageCircle} label="Komentarze" value={String(commentsCount)} valueClassName="text-xl" />
          <Card>
            <CardHeader>
              <CardTitle>Hashtagi</CardTitle>
            </CardHeader>
            <CardContent>
              {post.hashtags.length > 0 ? (
                <HashtagLinkList hashtags={post.hashtags} />
              ) : (
                <p className="text-sm text-muted-foreground">Ten post nie ma hashtagów.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Komentarze"
          description={`${commentsCount} wypowiedzi w drzewie dyskusji`}
        />
        {commentsQuery.isLoading ? <Skeleton className="h-64" /> : null}
        {commentsQuery.isError ? (
          <ErrorState
            isRetrying={commentsQuery.isFetching}
            onRetry={() => void commentsQuery.refetch()}
            size="compact"
            title="Nie udało się pobrać komentarzy"
          />
        ) : null}
        {commentsQuery.isSuccess ? <PostCommentSection comments={comments} postId={post.id} /> : null}
      </section>
    </div>
  )
}

function PostHeroVisual({ post }: { post: Post }) {
  if (post.imageUrl) {
    return (
      <img
        alt=""
        className="min-h-72 w-full bg-secondary/45 object-contain xl:h-full"
        src={post.imageUrl}
      />
    )
  }

  return (
    <div className="flex min-h-72 items-center justify-center bg-secondary text-primary">
      <MessageSquareText className="size-20" aria-hidden="true" />
    </div>
  )
}

type SectionHeaderProps = {
  title: string
  description: string
}

function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-normal text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function PostDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-36" />
      <Skeleton className="h-96" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Skeleton className="h-96" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-28" key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

function getParagraphs(content: string) {
  return postContentToText(content)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function getLead(content: string) {
  const firstParagraph = getParagraphs(content)[0] ?? content

  return firstParagraph.length > 220 ? `${firstParagraph.slice(0, 217).trim()}...` : firstParagraph
}

function countWords(content: string) {
  return postContentToText(content).split(/\s+/).filter(Boolean).length
}

function countComments(comments: Array<{ children: PostComment[] }>): number {
  return comments.reduce((total, comment) => total + 1 + countComments(comment.children), 0)
}
