import { Link } from 'react-router'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function NotFoundPage() {
  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Nie znaleziono strony</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Ten widok nie jest jeszcze dostępny w aplikacji.
        </p>
        <Button asChild>
          <Link to="/">Wróć na start</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
