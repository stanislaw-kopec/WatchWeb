import { Route, Routes } from 'react-router'

import { AppShell } from '@/app/shell/AppShell'
import { ArticleDetailsPage } from '@/pages/article-details/ArticleDetailsPage'
import { ArticlesPage } from '@/pages/articles/ArticlesPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { HomePage } from '@/pages/home/HomePage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { WatchDetailsPage } from '@/pages/watch-details/WatchDetailsPage'
import { WatchesPage } from '@/pages/watches/WatchesPage'
import { RequireAuth } from '@/features/auth/ui/RequireAuth'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="articles/:articleId" element={<ArticleDetailsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="me"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route path="register" element={<RegisterPage />} />
        <Route path="watches" element={<WatchesPage />} />
        <Route path="watches/:watchId" element={<WatchDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
