import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'

import { login } from '@/features/auth/api/authApi'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

const loginSchema = z.object({
  email: z.string().min(1, 'Podaj email.').email('Podaj poprawny adres email.'),
  password: z.string().min(1, 'Podaj hasło.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, signIn, user } = useAuthSession()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      signIn(response)
      navigate(getRedirectPath(searchParams.get('redirectTo')), { replace: true })
    },
  })

  if (isAuthenticated) {
    return (
      <AuthPageShell
        description="Możesz wrócić do katalogu albo kontynuować przeglądanie aplikacji jako zalogowany użytkownik."
        eyebrow="Sesja"
        title="Jesteś zalogowany"
      >
        <Card className="bg-secondary/50">
          <CardContent className="py-5">
            <p className="font-medium text-foreground">{user?.username}</p>
            <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
          </CardContent>
        </Card>
        <Button asChild className="w-full">
          <Link to="/watches">Przejdź do katalogu</Link>
        </Button>
      </AuthPageShell>
    )
  }

  function handleSubmit(values: LoginFormValues) {
    loginMutation.mutate(values)
  }

  return (
    <AuthPageShell
      description="Zaloguj się, aby korzystać z funkcji społecznościowych, recenzji, komentarzy i przyszłych widoków profilu."
      eyebrow="Logowanie"
      footer={
        <p className="text-sm text-muted-foreground">
          Nie masz konta?{' '}
          <Link className="font-medium text-primary hover:underline" to="/register">
            Zarejestruj się
          </Link>
        </p>
      }
      title="Wejdź do WatchWeb"
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Email</span>
          <Input
            autoComplete="email"
            type="email"
            {...form.register('email')}
          />
          <FormFieldError message={form.formState.errors.email?.message} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Hasło</span>
          <Input
            autoComplete="current-password"
            type="password"
            {...form.register('password')}
          />
          <FormFieldError message={form.formState.errors.password?.message} />
        </label>

        {loginMutation.isError ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {getErrorMessage(loginMutation.error)}
          </p>
        ) : null}

        <Button className="w-full" disabled={loginMutation.isPending} type="submit">
          <LogIn className="size-4" aria-hidden="true" />
          {loginMutation.isPending ? 'Logowanie' : 'Zaloguj'}
        </Button>
      </form>
    </AuthPageShell>
  )
}

function getRedirectPath(value: string | null) {
  return value?.startsWith('/') ? value : '/watches'
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się zalogować.'
}
