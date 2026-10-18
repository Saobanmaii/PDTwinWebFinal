import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

import LoginPage from '@/pages/Login'

// Admin / Teacher pages
import AdminDashboard from '@/pages/admin/Dashboard'
import UsersPage from '@/pages/admin/Users'
import PracticeSessionsPage from '@/pages/admin/PracticeSessions'

// Shared pages
import ClassroomsPage from '@/pages/Classrooms'
import ClassDetailPage from '@/pages/ClassDetail'
import ReportsPage from '@/pages/Reports'
import SettingsPage from '@/pages/Settings'

// Student pages
import StudentDashboard from '@/pages/student/Dashboard'
import PracticeSessionPage from '@/pages/student/PracticeSession'
import MyPracticePage from '@/pages/student/MyPractice'

// Teacher pages
import TeacherDashboard from '@/pages/teacher/Dashboard'

function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function SmartDashboard() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'STUDENT') return <StudentDashboard />
  if (user.role === 'TEACHER') return <TeacherDashboard />
  return <AdminDashboard />
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      {/* Dashboard — role-aware */}
      <Route path="/dashboard" element={
        <RequireAuth>
          <SmartDashboard />
        </RequireAuth>
      } />

      {/* Users — Admin only */}
      <Route path="/users" element={
        <RequireAuth roles={['ADMIN']}>
          <UsersPage />
        </RequireAuth>
      } />

      {/* Practice sessions management — Admin + Teacher */}
      <Route path="/practice-sessions" element={
        <RequireAuth roles={['ADMIN', 'TEACHER']}>
          <PracticeSessionsPage />
        </RequireAuth>
      } />

      {/* Classrooms — all roles */}
      <Route path="/classrooms" element={
        <RequireAuth>
          <ClassroomsPage />
        </RequireAuth>
      } />
      <Route path="/classrooms/:id" element={
        <RequireAuth>
          <ClassDetailPage />
        </RequireAuth>
      } />

      {/* Student — danh sách bài thực hành của tôi */}
      <Route path="/my-practice" element={
        <RequireAuth roles={['STUDENT']}>
          <MyPracticePage />
        </RequireAuth>
      } />

      {/* Student practice session */}
      <Route path="/practice/:assignmentId" element={
        <RequireAuth roles={['STUDENT']}>
          <PracticeSessionPage />
        </RequireAuth>
      } />

      {/* Reports */}
      <Route path="/reports" element={
        <RequireAuth roles={['ADMIN', 'TEACHER']}>
          <ReportsPage />
        </RequireAuth>
      } />

      {/* Settings */}
      <Route path="/settings" element={
        <RequireAuth>
          <SettingsPage />
        </RequireAuth>
      } />

      {/* Fallback */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
