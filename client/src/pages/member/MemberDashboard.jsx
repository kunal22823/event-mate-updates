import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import StatsCard from '../../components/StatsCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CalendarDays, Users, CheckCircle, PlusCircle } from 'lucide-react'

export default function MemberDashboard() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await apiClient.get('/events/member/mine')
        setEvents(res.data)
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const totalRegistrations = events.reduce((sum, e) => sum + (e.registrationCount || 0), 0)
  const totalAttended = events.reduce((sum, e) => sum + (e.attendedCount || 0), 0)

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Committee Member Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your events and track registrations</p>
        </div>
        <Link to="/member/add-event" className="btn-primary flex items-center gap-2">
          <PlusCircle size={18} />
          Add Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          icon={CalendarDays}
          label="Events Created"
          value={events.length}
          color="primary"
        />
        <StatsCard
          icon={Users}
          label="Total Registrations"
          value={totalRegistrations}
          color="amber"
        />
        <StatsCard
          icon={CheckCircle}
          label="Total Attended"
          value={totalAttended}
          color="emerald"
        />
      </div>

      {/* Recent Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Your Recent Events</h2>
          <Link to="/member/my-events" className="text-sm text-primary-600 font-medium hover:underline">
            View All
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">
            {"You haven't created any events yet."}{' '}
            <Link to="/member/add-event" className="text-primary-600 font-medium hover:underline">
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Event</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Registrations</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Attended</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 5).map((event) => (
                    <tr key={event._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          to={`/member/events/${event._id}`}
                          className="text-sm font-medium text-primary-600 hover:underline"
                        >
                          {event.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {new Date(event.eventDateTime).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{event.registrationCount || 0}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{event.attendedCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
