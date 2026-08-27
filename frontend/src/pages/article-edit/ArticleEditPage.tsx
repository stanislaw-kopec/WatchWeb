import { ArrowLeft, FilePenLine } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { useMyArticle } from '@/entities/article/api/useArticles'
import { ArticleStatusBadge } from '@/entities/article/ui/ArticleStatusBadge'
import { ArticleHeaderImageUploadForm } from '@/features/article-manage/ui/ArticleHeaderImageUploadForm'
import { EditArticleForm } from '@/features/article-manage/ui/EditArticleForm'
import { Button } from '@/shared/ui/button'
import { ErrorState } from '@/shared/ui/error-state'
import { Skeleton } from '@/shared/ui/skeleton'

export function ArticleEditPage() {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const articleQuery = useMyArticle(articleId)
  const [notice, setNotice] = useState<string | null>(null)

  if (articleQuery.isLoading) {
    return <Skeleton className="h-[720px]" />
  }

  if (articleQuery.isError || !articleQuery.data) {
    return (
      <ErrorState
        description="Sprawdź, czy artykuł istnieje i należy do Twojego konta."
        isRetrying={articleQuery.isFetching}
        onRetry={() => void articleQuery.refetch()}
        title="Nie udało się otworzyć edytora"
      />
    )
  }

  const article = articleQuery.data

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link to="/me/articles">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Moje artykuły
        </Link>
      </Button>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <ArticleStatusBadge status={article.status} />
          <FilePenLine className="size-5 text-primary" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-normal text-foreground md:text-4xl">
          {article.title || 'Bez tytułu'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Formatuj tekst, dodawaj obrazy i zapisuj postęp bez udostępniania szkicu publicznie.
        </p>
      </section>

      {notice ? <p className="rounded-md border border-primary/30 bg-secondary p-3 text-sm text-secondary-foreground">{notice}</p> : null}

      <EditArticleForm
        article={article}
        onCancel={() => navigate('/me/articles')}
        onPublished={(publishedArticle) => navigate(`/articles/${publishedArticle.id}`)}
        onUpdated={() => setNotice('Zmiany zostały zapisane.')}
      />

      <ArticleHeaderImageUploadForm
        article={article}
        onCancel={() => navigate('/me/articles')}
        onUploaded={() => setNotice('Obrazek nagłówkowy został zapisany.')}
      />
    </div>
  )
}
