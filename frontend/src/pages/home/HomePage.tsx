import { ArrowRight, MessageSquareText, ShieldCheck, Star, Watch } from 'lucide-react'
import { Link } from 'react-router'

import { WatchCatalogPreview } from '@/entities/watch/ui/WatchCatalogPreview'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

const highlights = [
  {
    title: 'Katalog',
    description: 'Filtrowane dane techniczne, opinie i oceny w jednym miejscu.',
    icon: Watch,
  },
  {
    title: 'Społeczność',
    description: 'Posty, komentarze i dyskusje wokół konkretnych modeli.',
    icon: MessageSquareText,
  },
  {
    title: 'Recenzje',
    description: 'Oceny użytkowników powiązane ze średnią i liczbą opinii.',
    icon: Star,
  },
  {
    title: 'Moderacja',
    description: 'Osobne ścieżki dla treści, zgłoszeń zegarków i ról.',
    icon: ShieldCheck,
  },
]

export function HomePage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <Badge variant="secondary">WatchWeb API</Badge>
          <div className="mt-5 max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-normal text-foreground md:text-5xl">
              Portal dla pasjonatów zegarków
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Katalog, społeczność, artykuły i recenzje połączone z backendem Spring Boot.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/watches">
                Katalog zegarków
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/posts">
                Posty społeczności
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <a
              className="inline-flex h-10 items-center rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground transition hover:bg-secondary"
              href="/swagger-ui.html"
            >
              Swagger UI
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {highlights.map((item) => (
            <Card key={item.title}>
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <WatchCatalogPreview />

      <Card>
        <CardHeader>
          <CardTitle>Następne moduły</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
            <p>Tworzenie, edycja i usuwanie własnych postów.</p>
            <p>Zgłoszenia nowych zegarków do katalogu.</p>
            <p>Moderacja treści oraz kolejek zgłoszeń.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
