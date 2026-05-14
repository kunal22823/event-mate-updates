import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/client'
import StatsCard from '../../components/StatsCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CalendarCheck, Award, CheckCircle, TrendingUp } from 'lucide-react'

export default function ParticipatedEvents() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [regsRes, statsRes] = await Promise.all([
        apiClient.get('/registrations/my'),
        apiClient.get('/registrations/stats/me'),
      ])
      
      // Filter to only participated events (excluding own created events)
      const participated = regsRes.data.filter(reg => {
        if (!reg.eventId) return false
        return reg.eventId.createdBy !== user?.id && reg.attended
      })
      
      setRegistrations(participated)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Failed to fetch participated events:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalParticipated = registrations.length
  const totalCreditsEarned = registrations.reduce((sum, reg) => {
    return sum + (reg.eventId?.credits || 0)
  }, 0)

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Participated Events</h1>
        <p className="text-slate-500 mt-1">Events where you have participated</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={CalendarCheck}
          label="Participated Events"
          value={totalParticipated}
          color="primary"
        />
        <StatsCard
          icon={Award}
          label="Credits Earned"
          value={totalCreditsEarned}
          color="emerald"
        />
        <StatsCard
          icon={CheckCircle}
          label="Attendance Rate"
          value={`${stats?.attendancePercentage || 0}%`}
          color="amber"
        />
        <StatsCard
          icon={TrendingUp}
          label="Total Registrations"
          value={stats?.totalRegistered || 0}
          color="sky"
        />
      </div>

      {/* Participated Events Table */}
      {registrations.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">
          You haven&apos;t participated in any events yet.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Event Title</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Date</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Committee</th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-slate-900">Status</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-slate-900">Credits Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {registrations.map((reg) => {
                  const event = reg.eventId
                  const eventDate = new Date(event.eventDateTime).toLocaleDateString('en-IN')
                  const statusColor = reg.attendanceStatus === 'Present' 
                    ? 'bg-green-100 text-green-800'
                    : reg.attendanceStatus === 'Absent'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'

                  return (
                    <tr key={reg._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{event.title}</p>
                          <p className="text-sm text-slate-500">{event.description?.substring(0, 50)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600 whitespace-nowrap">{eventDate}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{event.committeeName}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                          {reg.attendanceStatus}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-slate-900">
                        {event.credits || 0}
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
  )
}
