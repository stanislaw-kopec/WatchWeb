import type { PropsWithChildren, ReactNode } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

type AuthPageShellProps = PropsWithChildren<{
  eyebrow: string
  title: string
  description: string
  footer?: ReactNode
}>

export function AuthPageShell({ eyebrow, title, description, footer, children }: AuthPageShellProps) {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-normal text-foreground md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
          {description}
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {children}
          {footer ? <div className="border-t border-border pt-4">{footer}</div> : null}
        </CardContent>
      </Card>
    </div>
  )
}
