import { useState, useEffect } from 'react'
import apiClient from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Download, FileText, Loader } from 'lucide-react'

export default function ExportData() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/events')
      setEvents(res.data || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportRegistrations = async (eventId) => {
    try {
      setExporting(eventId)
      const response = await apiClient.post(
        `/export/event/${eventId}/registrations`,
        {},
        { responseType: 'blob' }
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `registrations_${eventId}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)
    } catch (error) {
      console.error('Failed to export:', error)
      alert('Failed to export registrations')
    } finally {
      setExporting(false)
    }
  }

  const handleExportAttendance = async (eventId) => {
    try {
      setExporting(eventId)
      const response = await apiClient.post(
        `/export/event/${eventId}/attendance-report`,
        {},
        { responseType: 'blob' }
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `attendance_${eventId}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)
    } catch (error) {
      console.error('Failed to export:', error)
      alert('Failed to export attendance report')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Export Data</h1>
        <p className="text-slate-500 mt-1">Export registrations and attendance reports for your events</p>
      </div>

      {events.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">You haven&apos;t created any events yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => {
            const isExporting = exporting === event._id
            return (
              <div key={event._id} className="card p-6 border border-slate-200">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {new Date(event.eventDateTime).toLocaleDateString()} • {event.committeeName}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {event.totalRegistrations || 0} registrations
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      {event.totalPresent || 0} present
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleExportRegistrations(event._id)}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {isExporting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Export Registrations
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleExportAttendance(event._id)}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors"
                  >
                    {isExporting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Export Attendance Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info Section */}
      <div className="card p-6 bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-slate-900 mb-2">What can you export?</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>Registrations:</strong> Full list of registered students with contact info and attendance status</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>Attendance Report:</strong> Detailed breakdown of attendance with summary statistics</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>All exports are in Excel format (.xlsx) for easy analysis</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
