import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

type PaginationProps = {
  page: number
  totalPages: number
  disabled?: boolean
  onPageChange: (page: number) => void
}

type PageItem = number | 'ellipsis-left' | 'ellipsis-right'

export function Pagination({ page, totalPages, disabled, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const pages = createPageItems(page, totalPages)
  const currentPage = page + 1

  return (
    <nav
      aria-label="Paginacja"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-sm text-muted-foreground">
        Strona {currentPage} z {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          aria-label="Poprzednia strona"
          disabled={disabled || page === 0}
          onClick={() => onPageChange(page - 1)}
          size="icon"
          type="button"
          variant="outline"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>

        {pages.map((item) =>
          typeof item === 'number' ? (
            <Button
              aria-current={item === page ? 'page' : undefined}
              className={cn('w-10 px-0', item === page && 'border-primary bg-primary text-primary-foreground')}
              disabled={disabled}
              key={item}
              onClick={() => onPageChange(item)}
              type="button"
              variant={item === page ? 'default' : 'outline'}
            >
              {item + 1}
            </Button>
          ) : (
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center text-sm text-muted-foreground"
              key={item}
            >
              ...
            </span>
          ),
        )}

        <Button
          aria-label="Następna strona"
          disabled={disabled || page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          size="icon"
          type="button"
          variant="outline"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}

function createPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index)
  }

  const items = new Set<number>([0, totalPages - 1, page])

  if (page > 0) {
    items.add(page - 1)
  }
  if (page < totalPages - 1) {
    items.add(page + 1)
  }
  if (page <= 2) {
    items.add(1)
    items.add(2)
  }
  if (page >= totalPages - 3) {
    items.add(totalPages - 2)
    items.add(totalPages - 3)
  }

  const sortedPages = Array.from(items)
    .filter((item) => item >= 0 && item < totalPages)
    .sort((first, second) => first - second)

  return sortedPages.reduce<PageItem[]>((result, item, index) => {
    const previous = sortedPages[index - 1]

    if (previous !== undefined && item - previous > 1) {
      result.push(item - previous === 2 ? previous + 1 : `ellipsis-${index < sortedPages.length / 2 ? 'left' : 'right'}`)
    }

    result.push(item)

    return result
  }, [])
}
