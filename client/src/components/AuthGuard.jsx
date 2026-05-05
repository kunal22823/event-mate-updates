import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function AuthGuard({ roles }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to user's own dashboard
    const dashboardMap = {
      student: '/student',
      member: '/member',
      superadmin: '/admin',
    }
    return <Navigate to={dashboardMap[user.role] || '/login'} replace />
  }

  return <Outlet />
}
