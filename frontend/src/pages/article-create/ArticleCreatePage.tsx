import { ArrowLeft, Newspaper } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { CreateArticleForm } from '@/features/article-manage/ui/CreateArticleForm'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

export function ArticleCreatePage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link to="/me/articles">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Moje artykuły
        </Link>
      </Button>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
        <Badge variant="secondary">Redakcja</Badge>
        <div className="mt-4 flex items-start gap-4">
          <div className="hidden size-12 shrink-0 items-center justify-center rounded-md bg-secondary text-primary sm:flex">
            <Newspaper className="size-6" aria-hidden="true" />
          </div>
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
              Nowy artykuł
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              Możesz zapisać prywatną wersję roboczą albo od razu opublikować gotowy materiał.
            </p>
          </div>
        </div>
      </section>

      <CreateArticleForm
        onDraftSaved={(article) => navigate(`/me/articles/${article.id}/edit`)}
        onPublished={(article) => navigate(`/articles/${article.id}`)}
      />
    </div>
  )
}
