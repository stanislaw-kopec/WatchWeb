import { Route, Routes } from 'react-router'

import { AppShell } from '@/app/shell/AppShell'
import { HomePage } from '@/pages/home/HomePage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { WatchDetailsPage } from '@/pages/watch-details/WatchDetailsPage'
import { WatchesPage } from '@/pages/watches/WatchesPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="watches" element={<WatchesPage />} />
        <Route path="watches/:watchId" element={<WatchDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
