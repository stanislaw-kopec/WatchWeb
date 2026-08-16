import { FileText, Watch } from 'lucide-react'
import { NavLink } from 'react-router'

import { cn } from '@/shared/lib/utils'

const MODERATION_TABS = [
  { label: 'Posty', href: '/moderation', icon: FileText },
  { label: 'Zgłoszenia zegarków', href: '/moderation/watch-submissions', icon: Watch },
]

export function ModerationQueueTabs() {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Kolejki moderacji">
      {MODERATION_TABS.map((item) => (
        <NavLink
          className={({ isActive }) =>
            cn(
              'inline-flex h-10 items-center gap-2 rounded-md border border-input bg-card px-4 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-secondary-foreground',
              isActive && 'border-primary bg-secondary text-secondary-foreground',
            )
          }
          end={item.href === '/moderation'}
          key={item.href}
          to={item.href}
        >
          <item.icon className="size-4" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
