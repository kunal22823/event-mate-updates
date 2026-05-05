import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { CalendarDays, Users, BarChart3, CheckCircle } from 'lucide-react'

export default function Landing() {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated && user) {
    const dashboardMap = {
      student: '/student',
      member: '/member',
      superadmin: '/admin',
    }
    return <Navigate to={dashboardMap[user.role] || '/login'} replace />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays size={28} className="text-primary-600" />
            <span className="font-bold text-xl text-slate-900">Event Mate</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6">
            <CalendarDays size={16} />
            SIES College of Management Studies
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 mb-6 text-balance leading-tight">
            Manage College Events
            <br />
            <span className="text-primary-600">Effortlessly</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 text-pretty leading-relaxed">
            Event Mate is the all-in-one platform for creating, managing, and tracking college events.
            Designed for students, committee members, and administrators.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3">
              Get Started
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 text-center mb-12">
            Everything you need for event management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8">
              <div className="p-3 bg-primary-50 text-primary-600 rounded-xl w-fit mb-4">
                <CalendarDays size={28} />
              </div>
              <h3 className="font-semibold text-lg text-slate-900 mb-2">Event Management</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Create, update, and manage events with image uploads, date scheduling, and location tracking.
              </p>
            </div>
            <div className="card p-8">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
                <Users size={28} />
              </div>
              <h3 className="font-semibold text-lg text-slate-900 mb-2">Student Registration</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                One-click event registration for students with automated email confirmations and attendance tracking.
              </p>
            </div>
            <div className="card p-8">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-4">
                <BarChart3 size={28} />
              </div>
              <h3 className="font-semibold text-lg text-slate-900 mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Comprehensive analytics with charts for event trends, registrations, and attendance rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 text-center mb-12">
            Built for every role
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Students',
                features: ['Browse and register for events', 'Track attendance status', 'View participation stats', 'Personal profile dashboard'],
              },
              {
                title: 'Committee Members',
                features: ['Create and manage events', 'Upload event images', 'Mark student attendance', 'View registration lists'],
              },
              {
                title: 'Super Admins',
                features: ['System-wide analytics', 'Manage all users', 'Oversee all events', 'Full administrative control'],
              },
            ].map((role) => (
              <div key={role.title} className="card p-8">
                <h3 className="font-semibold text-lg text-slate-900 mb-4">{role.title}</h3>
                <ul className="space-y-3">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500">
          Event Mate - SIES College of Management Studies. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
