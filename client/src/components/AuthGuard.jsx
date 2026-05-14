import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function AuthGuard({ roles, requireApproved = false }) {
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

  // Check if approval is required and user is a member
  if (requireApproved && user.role === 'member' && !user.committeeApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <div className="inline-block w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Pending Approval</h1>
          <p className="text-slate-600 mb-4">
            Your committee membership is pending approval from administrators. Once approved, you will be able to
            access this feature.
          </p>
          <p className="text-slate-500 text-sm">Status: {user.committeeStatus || 'pending'}</p>
        </div>
      </div>
    )
  }

  return <Outlet />
}
