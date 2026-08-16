import { Route, Routes } from 'react-router'

import { AppShell } from '@/app/shell/AppShell'
import { AdminUsersPage } from '@/pages/admin-users/AdminUsersPage'
import { ArticleDetailsPage } from '@/pages/article-details/ArticleDetailsPage'
import { ArticlesPage } from '@/pages/articles/ArticlesPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { HomePage } from '@/pages/home/HomePage'
import { MyPostsPage } from '@/pages/my-posts/MyPostsPage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { PostCreatePage } from '@/pages/post-create/PostCreatePage'
import { PostDetailsPage } from '@/pages/post-details/PostDetailsPage'
import { PostsPage } from '@/pages/posts/PostsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { WatchDetailsPage } from '@/pages/watch-details/WatchDetailsPage'
import { WatchesPage } from '@/pages/watches/WatchesPage'
import { RequireAuth } from '@/features/auth/ui/RequireAuth'
import { RequireRole } from '@/features/auth/ui/RequireRole'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="articles/:articleId" element={<ArticleDetailsPage />} />
        <Route
          path="admin/users"
          element={
            <RequireRole allowedRoles={['ROLE_ADMIN']}>
              <AdminUsersPage />
            </RequireRole>
          }
        />
        <Route path="posts" element={<PostsPage />} />
        <Route
          path="posts/new"
          element={
            <RequireAuth>
              <PostCreatePage />
            </RequireAuth>
          }
        />
        <Route path="posts/:postId" element={<PostDetailsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="me"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="me/posts"
          element={
            <RequireAuth>
              <MyPostsPage />
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
