import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/client'
import StatsCard from '../../components/StatsCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CalendarDays, Users, CheckCircle, PlusCircle, TrendingUp, Download, BarChart3, AlertCircle } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export default function UnifiedDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('participations')
  const [participations, setParticipations] = useState([])
  const [createdEvents, setCreatedEvents] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [partRes, statsRes] = await Promise.all([
        apiClient.get('/registrations/my'),
        apiClient.get('/registrations/stats/me'),
      ])

      setParticipations(partRes.data || [])
      setStats(statsRes.data)

      // Only fetch created events if user is an approved committee member
      if (user?.role === 'member' && user?.committeeApproved) {
        try {
          const eventsRes = await apiClient.get('/events/member/mine')
          setCreatedEvents(eventsRes.data || [])
        } catch (error) {
          console.error('Failed to fetch created events:', error)
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const eventChartData = createdEvents.map((e) => ({
    name: e.title.substring(0, 15),
    registrations: e.totalRegistrations || 0,
    present: e.totalPresent || 0,
  }))

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage events and track registrations</p>
        </div>
        {user?.role === 'member' && user?.committeeApproved && (
          <div className="flex gap-2">
            <button
              onClick={() => window.location.href = '/member/export'}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
            <button
              onClick={() => window.location.href = '/member/add-event'}
              className="btn-primary flex items-center gap-2"
            >
              <PlusCircle size={18} />
              Add Event
            </button>
          </div>
        )}
      </div>

      {/* Approval Status Alert */}
      {user?.role === 'member' && !user?.committeeApproved && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Pending Approval</h3>
            <p className="text-yellow-800 text-sm">Your committee membership is pending approval. Once approved, you'll be able to create events and access management features.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={CalendarDays}
          label="Events Attended"
          value={stats?.totalAttended || 0}
          color="primary"
        />
        <StatsCard
          icon={Users}
          label="Total Registrations"
          value={stats?.totalRegistered || 0}
          color="amber"
        />
        <StatsCard
          icon={CheckCircle}
          label="Attendance Rate"
          value={`${stats?.attendancePercentage || 0}%`}
          color="emerald"
        />
        <StatsCard
          icon={TrendingUp}
          label="Total Credits"
          value={stats?.totalCredits || 0}
          color="violet"
        />
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-slate-200 flex">
          <button
            onClick={() => setActiveTab('participations')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'participations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Participations
          </button>
          {user?.role === 'member' && user?.committeeApproved && (
            <>
              <button
                onClick={() => setActiveTab('management')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'management'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Event Management
              </button>
              <button
                onClick={() => setActiveTab('created')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'created'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Created Events
              </button>
            </>
          )}
        </div>

        <div className="p-6">
          {/* Participations Tab */}
          {activeTab === 'participations' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Event Registrations</h3>
              {participations.length === 0 ? (
                <p className="text-slate-500">You haven&apos;t registered for any events yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Event</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Date</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Attendance</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participations.map((reg) => (
                        <tr key={reg._id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">{reg.eventId?.title}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {new Date(reg.eventId?.eventDateTime).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              reg.attendanceStatus === 'Present'
                                ? 'bg-green-100 text-green-800'
                                : reg.attendanceStatus === 'Absent'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {reg.attendanceStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {reg.participated && (
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                                Participated
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Event Management Tab */}
          {activeTab === 'management' && user?.role === 'member' && user?.committeeApproved && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => window.location.href = '/member/add-event'}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <PlusCircle className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="font-semibold text-slate-900">Create Event</p>
                  <p className="text-sm text-slate-600">Add a new event</p>
                </button>
                <button
                  onClick={() => window.location.href = '/member/my-events'}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="font-semibold text-slate-900">My Events</p>
                  <p className="text-sm text-slate-600">View your events</p>
                </button>
                <button
                  onClick={() => window.location.href = '/member/export'}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <Download className="w-6 h-6 text-green-600 mb-2" />
                  <p className="font-semibold text-slate-900">Export Data</p>
                  <p className="text-sm text-slate-600">Download reports</p>
                </button>
              </div>
            </div>
          )}

          {/* Created Events Tab */}
          {activeTab === 'created' && user?.role === 'member' && user?.committeeApproved && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Created Events</h3>
              
              {eventChartData.length > 0 && (
                <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-4">Event Performance</h4>
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

              {createdEvents.length === 0 ? (
                <p className="text-slate-500">You haven&apos;t created any events yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Event</th>
                        <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Date</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">Registrations</th>
                        <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {createdEvents.map((event) => {
                        const attendanceRate = event.totalRegistrations > 0
                          ? Math.round((event.totalPresent / event.totalRegistrations) * 100)
                          : 0
                        return (
                          <tr key={event._id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{event.title}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {new Date(event.eventDateTime).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-slate-600">{event.totalRegistrations || 0}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                {attendanceRate}%
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
