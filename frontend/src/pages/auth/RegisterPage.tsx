import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'

import { login, registerUser } from '@/features/auth/api/authApi'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { AuthPageShell } from '@/features/auth/ui/AuthPageShell'
import { FormFieldError } from '@/features/auth/ui/FormFieldError'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Nazwa użytkownika musi mieć co najmniej 3 znaki.')
      .max(50, 'Nazwa użytkownika może mieć maksymalnie 50 znaków.'),
    email: z.string().min(1, 'Podaj email.').email('Podaj poprawny adres email.'),
    password: z
      .string()
      .min(8, 'Hasło musi mieć co najmniej 8 znaków.')
      .max(72, 'Hasło może mieć maksymalnie 72 znaki.'),
    confirmPassword: z.string().min(1, 'Powtórz hasło.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Hasła muszą być takie same.',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated, signIn, user } = useAuthSession()
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      await registerUser({
        username: values.username,
        email: values.email,
        password: values.password,
      })

      return login({
        email: values.email,
        password: values.password,
      })
    },
    onSuccess: (response) => {
      signIn(response)
      navigate('/watches', { replace: true })
    },
  })

  if (isAuthenticated) {
    return (
      <AuthPageShell
        description="Masz już aktywną sesję. Możesz przejść do katalogu albo wylogować się z górnego paska."
        eyebrow="Rejestracja"
        title="Konto jest aktywne"
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

  function handleSubmit(values: RegisterFormValues) {
    registerMutation.mutate({
      ...values,
      username: values.username.trim(),
      email: values.email.trim().toLowerCase(),
    })
  }

  return (
    <AuthPageShell
      description="Utwórz konto użytkownika, aby później dodawać recenzje, komentarze, zgłoszenia zegarków i treści społecznościowe."
      eyebrow="Rejestracja"
      footer={
        <p className="text-sm text-muted-foreground">
          Masz już konto?{' '}
          <Link className="font-medium text-primary hover:underline" to="/login">
            Zaloguj się
          </Link>
        </p>
      }
      title="Dołącz do WatchWeb"
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Nazwa użytkownika</span>
          <Input autoComplete="username" {...form.register('username')} />
          <FormFieldError message={form.formState.errors.username?.message} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Email</span>
          <Input autoComplete="email" type="email" {...form.register('email')} />
          <FormFieldError message={form.formState.errors.email?.message} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Hasło</span>
          <Input autoComplete="new-password" type="password" {...form.register('password')} />
          <FormFieldError message={form.formState.errors.password?.message} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Powtórz hasło</span>
          <Input autoComplete="new-password" type="password" {...form.register('confirmPassword')} />
          <FormFieldError message={form.formState.errors.confirmPassword?.message} />
        </label>

        {registerMutation.isError ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {getErrorMessage(registerMutation.error)}
          </p>
        ) : null}

        <Button className="w-full" disabled={registerMutation.isPending} type="submit">
          <UserPlus className="size-4" aria-hidden="true" />
          {registerMutation.isPending ? 'Tworzenie konta' : 'Zarejestruj'}
        </Button>
      </form>
    </AuthPageShell>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Nie udało się utworzyć konta.'
}
