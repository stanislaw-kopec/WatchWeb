import {
  Bell,
  Compass,
  LogIn,
  LogOut,
  MessageSquareText,
  Newspaper,
  Search,
  ShieldCheck,
  UserCircle,
  UserPlus,
  Watch,
} from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router'

import { USER_ROLE_LABELS } from '@/features/auth/model/roleLabels'
import { useAuthSession } from '@/features/auth/model/useAuthSession'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

const navigation = [
  { label: 'Start', href: '/', icon: Compass },
  { label: 'Katalog', href: '/watches', icon: Watch },
  { label: 'Posty', href: '/posts', icon: MessageSquareText },
  { label: 'Artykuły', href: '/articles', icon: Newspaper },
  { label: 'Moderacja', href: '/moderation', icon: ShieldCheck },
]

export function AppShell() {
  const { isAuthenticated, signOut, user } = useAuthSession()

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-border bg-card/85 px-5 py-6 backdrop-blur lg:block">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Watch className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">WatchWeb</p>
            <p className="text-xs text-muted-foreground">community catalog</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-secondary-foreground',
                  isActive && 'bg-secondary text-secondary-foreground',
                )
              }
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-card px-3 text-muted-foreground">
              <Search className="size-4 shrink-0" aria-hidden="true" />
              <input
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Szukaj zegarków, marek, postów i artykułów"
                type="search"
              />
            </div>
            <Button variant="ghost" size="icon" aria-label="Powiadomienia">
              <Bell className="size-4" aria-hidden="true" />
            </Button>
            {isAuthenticated && user ? (
              <>
                <Link
                  className="hidden min-w-0 items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 transition hover:bg-secondary sm:flex"
                  to="/me"
                >
                  <UserCircle className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{USER_ROLE_LABELS[user.role]}</p>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" aria-label="Wyloguj" onClick={() => void signOut()}>
                  <LogOut className="size-4" aria-hidden="true" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-1">
                <Button asChild variant="outline" size="sm">
                  <Link to="/login">
                    <LogIn className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Zaloguj</span>
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/register">
                    <UserPlus className="size-4" aria-hidden="true" />
                    <span className="hidden md:inline">Rejestracja</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <nav className="mx-auto mt-3 flex max-w-7xl gap-1 overflow-x-auto lg:hidden" aria-label="Nawigacja">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-secondary-foreground',
                    isActive && 'bg-secondary text-secondary-foreground',
                  )
                }
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
