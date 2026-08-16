import { ArrowLeft, ListChecks, Send } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import type { WatchSubmissionResponse } from '@/entities/watch/model/submissionTypes'
import { WatchSubmissionStatusBadge } from '@/entities/watch/ui/WatchSubmissionStatusBadge'
import { CreateWatchSubmissionForm } from '@/features/watch-submission-create/ui/CreateWatchSubmissionForm'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function WatchSubmitPage() {
  const [createdSubmission, setCreatedSubmission] = useState<WatchSubmissionResponse | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/watches">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Wróć do katalogu
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/me/watch-submissions">
            <ListChecks className="size-4" aria-hidden="true" />
            Moje zgłoszenia
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
          <Badge variant="secondary">Katalog zegarków</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
            Zgłoś zegarek do katalogu
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Po wysłaniu zgłoszenie trafi do moderatora. Po akceptacji pojawi się jako wpis w katalogu.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Przebieg</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Nowe zgłoszenie dostaje status oczekujący.</p>
            <p>Moderator może je zaakceptować albo odrzucić z powodem widocznym dla autora.</p>
          </CardContent>
        </Card>
      </section>

      {createdSubmission ? (
        <Card className="border-primary/30">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <WatchSubmissionStatusBadge status={createdSubmission.status} />
                <span className="text-sm text-muted-foreground">{createdSubmission.message}</span>
              </div>
              <p className="mt-2 text-lg font-semibold tracking-normal text-foreground">
                {createdSubmission.brand} {createdSubmission.model}
              </p>
            </div>
            <Button asChild>
              <Link to="/me/watch-submissions">
                <Send className="size-4" aria-hidden="true" />
                Sprawdź status
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <CreateWatchSubmissionForm onCreated={setCreatedSubmission} />
    </div>
  )
}
