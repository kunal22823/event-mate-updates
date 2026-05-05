import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  UserCircle,
  PlusCircle,
  FolderOpen,
  Users,
  BarChart3,
  Shield,
  X,
  Download,
  TrendingUp,
} from 'lucide-react'

const navItems = {
  student: [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/events', icon: CalendarDays, label: 'Browse Events' },
    { to: '/student/my-events', icon: CalendarCheck, label: 'My Events' },
    { to: '/student/profile', icon: UserCircle, label: 'Profile' },
  ],
  member: [
    { to: '/member', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/member/add-event', icon: PlusCircle, label: 'Add Event' },
    { to: '/member/my-events', icon: FolderOpen, label: 'My Events' },
    { to: '/member/export', icon: Download, label: 'Export Data' },
  ],
  superadmin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/events', icon: CalendarDays, label: 'Manage Events' },
    { to: '/admin/members', icon: Shield, label: 'Manage Members' },
    { to: '/admin/students', icon: Users, label: 'Manage Students' },
    { to: '/admin/analytics/events', icon: BarChart3, label: 'Event Analytics' },
    { to: '/admin/analytics/students', icon: TrendingUp, label: 'Student Analytics' },
  ],
}

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const items = navItems[user?.role] || []

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200
          transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0 lg:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 lg:hidden">
          <span className="font-bold text-lg text-slate-900">Menu</span>
          <button
            onClick={onClose}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/student' || item.to === '/member' || item.to === '/admin'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
