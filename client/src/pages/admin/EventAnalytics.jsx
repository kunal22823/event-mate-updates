import { useState, useEffect } from 'react'
import apiClient from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Download, Filter } from 'lucide-react'
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
  Cell,
} from 'recharts'

export default function EventAnalytics() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventStats, setEventStats] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/analytics/events')
      setEvents(res.data || [])
      if (res.data && res.data.length > 0) {
        setSelectedEvent(res.data[0])
        fetchEventStats(res.data[0]._id)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEventStats = async (eventId) => {
    try {
      const res = await apiClient.get(`/registrations/event/${eventId}/detailed-stats`)
      setEventStats(res.data)
    } catch (error) {
      console.error('Failed to fetch event stats:', error)
    }
  }

  const handleEventChange = (event) => {
    setSelectedEvent(event)
    fetchEventStats(event._id)
  }

  const handleExport = async () => {
    if (!selectedEvent) return
    try {
      setExporting(true)
      const response = await apiClient.post(
        `/export/event/${selectedEvent._id}/registrations`,
        {},
        { responseType: 'blob' }
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `event_registrations_${selectedEvent._id}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)
    } catch (error) {
      console.error('Failed to export:', error)
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const chartData = eventStats?.registrations ? [
    {
      name: 'Present',
      count: eventStats.registrations.filter((r) => r.attendanceStatus === 'Present').length,
    },
    {
      name: 'Absent',
      count: eventStats.registrations.filter((r) => r.attendanceStatus === 'Absent').length,
    },
    {
      name: 'Not Marked',
      count: eventStats.registrations.filter((r) => r.attendanceStatus === 'Not Marked').length,
    },
  ] : []

  const colors = ['#10b981', '#ef4444', '#94a3b8']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Event Analytics</h1>
        <p className="text-slate-500 mt-1">Detailed analytics for each event</p>
      </div>

      {/* Event Selector */}
      <div className="card p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select Event</label>
        <select
          value={selectedEvent?._id || ''}
          onChange={(e) => {
            const event = events.find((ev) => ev._id === e.target.value)
            if (event) handleEventChange(event)
          }}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">-- Select an event --</option>
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.title} ({new Date(event.eventDateTime).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      {selectedEvent && eventStats && (
        <>
          {/* Event Header */}
          <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedEvent.title}</h2>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Total Registrations</p>
                    <p className="text-2xl font-bold text-slate-900">{eventStats.totalRegistrations}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Present</p>
                    <p className="text-2xl font-bold text-green-600">{eventStats.presentCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{eventStats.absentCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Attendance Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{eventStats.attendanceRate}%</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4">
              <p className="text-sm text-slate-600 mb-1">Not Marked</p>
              <p className="text-2xl font-bold text-slate-900">{eventStats.notMarkedCount}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-slate-600 mb-1">Avg Participation (mins)</p>
              <p className="text-2xl font-bold text-slate-900">{eventStats.avgParticipationDuration}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-slate-600 mb-1">Certificates Issued</p>
              <p className="text-2xl font-bold text-slate-900">{eventStats.certificatesIssued}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-slate-600 mb-1">Credits Distributed</p>
              <p className="text-2xl font-bold text-slate-900">{eventStats.totalCreditsDistributed}</p>
            </div>
          </div>

          {/* Attendance Chart */}
          <div className="card p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Attendance Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Registrations Table */}
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Detailed Registrations</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Student Name</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Email</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Course</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Attendance</th>
                    <th className="text-center px-6 py-3 text-sm font-semibold text-slate-900">Duration (mins)</th>
                    <th className="text-center px-6 py-3 text-sm font-semibold text-slate-900">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {eventStats.registrations.slice(0, 20).map((reg) => (
                    <tr key={reg._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 text-sm text-slate-700 font-medium">{reg.studentId.name}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{reg.studentId.email}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{reg.studentId.course || 'N/A'}</td>
                      <td className="px-6 py-3 text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            reg.attendanceStatus === 'Present'
                              ? 'bg-green-100 text-green-800'
                              : reg.attendanceStatus === 'Absent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {reg.attendanceStatus}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600 text-center">{reg.participationDuration}</td>
                      <td className="px-6 py-3 text-sm text-center">
                        {reg.certificateIssued ? (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                            Yes
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {eventStats.registrations.length > 20 && (
                <div className="px-6 py-3 text-sm text-slate-600 bg-slate-50 border-t border-slate-200">
                  Showing 20 of {eventStats.registrations.length} registrations
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
