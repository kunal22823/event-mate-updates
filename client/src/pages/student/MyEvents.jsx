import { useState, useEffect } from 'react'
import apiClient from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CheckCircle, XCircle, MinusCircle, Calendar, MapPin, Award } from 'lucide-react'

export default function MyEvents() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await apiClient.get('/registrations/my')
        setRegistrations(res.data)
      } catch (error) {
        console.error('Failed to fetch registrations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRegistrations()
  }, [])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle size={12} /> Present
          </span>
        )
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">
            <XCircle size={12} /> Absent
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            <MinusCircle size={12} /> Not Marked
          </span>
        )
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Registered Events</h1>
        <p className="text-slate-500 mt-1">View all events you have registered for</p>
      </div>

      {registrations.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">
          {"You haven't registered for any events yet. Browse events to get started!"}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">#</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Event</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Attendance</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Credits</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Participated</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, index) => (
                  <tr key={reg._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-600">{index + 1}</td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-slate-900">{reg.eventId?.title || 'N/A'}</p>
                      {reg.eventId?.createdBy && (
                        <p className="text-xs text-slate-400 mt-0.5">by {reg.eventId.createdBy.name}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        {reg.eventId?.eventDateTime
                          ? new Date(reg.eventId.eventDateTime).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        {reg.eventId?.location || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(reg.attendanceStatus)}</td>
                    <td className="py-3 px-4">
                      {reg.creditsAssigned && reg.eventId?.credits ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                          <Award size={12} /> {reg.eventId.credits}
                        </span>
                      ) : reg.eventId?.credits ? (
                        <span className="text-xs text-slate-400">--</span>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {reg.participated ? (
                        <span className="text-xs font-medium text-emerald-600">Yes</span>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
