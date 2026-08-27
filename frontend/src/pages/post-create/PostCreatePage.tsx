import { ArrowLeft, CheckCircle2, Clock, ListChecks } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import type { Post } from '@/entities/post/model/types'
import { PostStatusBadge } from '@/entities/post/ui/PostStatusBadge'
import { CreatePostForm } from '@/features/post-create/ui/CreatePostForm'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function PostCreatePage() {
  const [createdPost, setCreatedPost] = useState<Post | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/posts">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Wróć do postów
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/me/posts">
            <ListChecks className="size-4" aria-hidden="true" />
            Moje posty
          </Link>
        </Button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
            <Badge variant="secondary">Społeczność</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
              Dodaj post
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Możesz zapisać szkic prywatnie albo wysłać wpis do moderacji. Publicznie pojawi się
              dopiero po akceptacji moderatora.
            </p>
          </div>

          <CreatePostForm onCreated={setCreatedPost} />
        </div>

        <aside className="space-y-4">
          {createdPost ? (
            <Card className="border-primary/40">
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                  <CheckCircle2 className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle>{createdPost.status === 'DRAFT' ? 'Szkic zapisany' : 'Post zapisany'}</CardTitle>
                  <div className="mt-2">
                    <PostStatusBadge status={createdPost.status} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-foreground">{createdPost.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {createdPost.status === 'DRAFT'
                      ? 'Szkic znajdziesz w swoim panelu postów.'
                      : 'Status wpisu możesz śledzić w swoim panelu postów.'}
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link to="/me/posts">Przejdź do moich postów</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Moderacja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <p>Posty użytkowników startują jako oczekujące.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <p>Zaakceptowany wpis trafia do publicznej listy społeczności.</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  )
}
