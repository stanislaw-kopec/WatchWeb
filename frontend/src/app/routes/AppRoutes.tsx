import { Route, Routes } from 'react-router'

import { AppShell } from '@/app/shell/AppShell'
import { AdminUsersPage } from '@/pages/admin-users/AdminUsersPage'
import { ArticleDetailsPage } from '@/pages/article-details/ArticleDetailsPage'
import { ArticlesPage } from '@/pages/articles/ArticlesPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { HomePage } from '@/pages/home/HomePage'
import { ModerationPage } from '@/pages/moderation/ModerationPage'
import { MyPostsPage } from '@/pages/my-posts/MyPostsPage'
import { MyWatchSubmissionsPage } from '@/pages/my-watch-submissions/MyWatchSubmissionsPage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { NotificationsPage } from '@/pages/notifications/NotificationsPage'
import { PostCreatePage } from '@/pages/post-create/PostCreatePage'
import { PostDetailsPage } from '@/pages/post-details/PostDetailsPage'
import { PostsPage } from '@/pages/posts/PostsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { UserProfilePage } from '@/pages/user-profile/UserProfilePage'
import { WatchSubmissionModerationPage } from '@/pages/watch-submission-moderation/WatchSubmissionModerationPage'
import { WatchDetailsPage } from '@/pages/watch-details/WatchDetailsPage'
import { WatchSubmitPage } from '@/pages/watch-submit/WatchSubmitPage'
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
          path="moderation"
          element={
            <RequireRole allowedRoles={['ROLE_MODERATOR', 'ROLE_ADMIN']}>
              <ModerationPage />
            </RequireRole>
          }
        />
        <Route
          path="moderation/watch-submissions"
          element={
            <RequireRole allowedRoles={['ROLE_MODERATOR', 'ROLE_ADMIN']}>
              <WatchSubmissionModerationPage />
            </RequireRole>
          }
        />
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
        <Route
          path="me/watch-submissions"
          element={
            <RequireAuth>
              <MyWatchSubmissionsPage />
            </RequireAuth>
          }
        />
        <Route
          path="notifications"
          element={
            <RequireAuth>
              <NotificationsPage />
            </RequireAuth>
          }
        />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="users/:userId"
          element={
            <RequireAuth>
              <UserProfilePage />
            </RequireAuth>
          }
        />
        <Route path="watches" element={<WatchesPage />} />
        <Route
          path="watches/submit"
          element={
            <RequireAuth>
              <WatchSubmitPage />
            </RequireAuth>
          }
        />
        <Route path="watches/:watchId" element={<WatchDetailsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
