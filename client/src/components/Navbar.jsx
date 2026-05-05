import { useAuth } from '../context/AuthContext'
import { LogOut, Menu, CalendarDays } from 'lucide-react'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()

  const roleBadgeColors = {
    student: 'bg-primary-100 text-primary-700',
    member: 'bg-amber-100 text-amber-700',
    superadmin: 'bg-emerald-100 text-emerald-700',
  }

  const roleLabels = {
    student: 'Student',
    member: 'Committee Member',
    superadmin: 'Super Admin',
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <CalendarDays size={24} className="text-primary-600" />
          <span className="font-bold text-lg text-slate-900">Event Mate</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleBadgeColors[user.role]}`}>
              {roleLabels[user.role]}
            </span>
            <span className="text-sm text-slate-600 hidden sm:block">{user.name}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  )
}
