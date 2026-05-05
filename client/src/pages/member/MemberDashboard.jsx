import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import StatsCard from '../../components/StatsCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CalendarDays, Users, CheckCircle, PlusCircle, TrendingUp, Download, BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export default function MemberDashboard() {
  const [memberAnalytics, setMemberAnalytics] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, eventsRes] = await Promise.all([
        apiClient.get('/auth/me'),
        apiClient.get('/events/member/mine'),
      ])
      
      setUserId(userRes.data.user.id)
      setEvents(eventsRes.data || [])
      
      // Fetch member analytics
      if (userRes.data.user.id) {
        try {
          const analyticsRes = await apiClient.get(`/analytics/member/${userRes.data.user.id}`)
          setMemberAnalytics(analyticsRes.data)
        } catch (error) {
          console.error('Failed to fetch analytics:', error)
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalRegistrations = events.reduce((sum, e) => sum + (e.totalRegistrations || 0), 0)
  const totalPresent = events.reduce((sum, e) => sum + (e.totalPresent || 0), 0)

  if (loading) return <LoadingSpinner />

  const eventChartData = events.map((e) => ({
    name: e.title.substring(0, 15),
    registrations: e.totalRegistrations || 0,
    present: e.totalPresent || 0,
  }))

  const attendanceRate = totalRegistrations > 0 
    ? Math.round((totalPresent / totalRegistrations) * 100) 
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Committee Member Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your events and track registrations</p>
        </div>
        <div className="flex gap-2">
          <Link to="/member/export" className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export
          </Link>
          <Link to="/member/add-event" className="btn-primary flex items-center gap-2">
            <PlusCircle size={18} />
            Add Event
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          value={totalPresent}
          color="emerald"
        />
        <StatsCard
          icon={TrendingUp}
          label="Attendance Rate"
          value={`${attendanceRate}%`}
          color="violet"
        />
      </div>

      {/* Analytics Chart */}
      {eventChartData.length > 0 && (
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Event Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend />
              <Bar dataKey="registrations" name="Registrations" fill="#3b82f6" />
              <Bar dataKey="present" name="Present" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Your Events</h2>
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
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Registrations</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Present</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Attendance %</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 10).map((event) => {
                    const eventAttendanceRate = event.totalRegistrations > 0 
                      ? Math.round((event.totalPresent / event.totalRegistrations) * 100)
                      : 0
                    return (
                      <tr key={event._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            to={`/member/events/${event._id}`}
                            className="text-sm font-medium text-primary-600 hover:underline block truncate"
                          >
                            {event.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 whitespace-nowrap">
                          {new Date(event.eventDateTime).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 text-right">{event.totalRegistrations || 0}</td>
                        <td className="py-3 px-4 text-sm text-slate-600 text-right font-medium text-green-600">{event.totalPresent || 0}</td>
                        <td className="py-3 px-4 text-sm text-right">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {eventAttendanceRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link
                            to={`/member/events/${event._id}`}
                            className="text-xs font-medium text-primary-600 hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
