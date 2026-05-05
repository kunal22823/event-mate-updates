import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import apiClient from '../../api/client'
import AttendanceTable from '../../components/AttendanceTable'
import StatsCard from '../../components/StatsCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle, XCircle, Award, Building2 } from 'lucide-react'

export default function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingAttendance, setMarkingAttendance] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, regsRes] = await Promise.all([
          apiClient.get(`/events/${id}`),
          apiClient.get(`/registrations/event/${id}`),
        ])
        setEvent(eventRes.data)
        setRegistrations(regsRes.data)
      } catch (error) {
        console.error('Failed to fetch event details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleMarkAttendance = async (registrationId, status) => {
    setMarkingAttendance(true)
    try {
      await apiClient.put(`/registrations/${registrationId}/attendance`, {
        attendanceStatus: status,
      })
      const regsRes = await apiClient.get(`/registrations/event/${id}`)
      setRegistrations(regsRes.data)
      toast.success(`Attendance marked as ${status}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark attendance.')
    } finally {
      setMarkingAttendance(false)
    }
  }

  if (loading) return <LoadingSpinner />

  if (!event) {
    return (
      <div className="card p-8 text-center text-slate-500">
        Event not found.{' '}
        <Link to="/member/my-events" className="text-primary-600 font-medium hover:underline">
          Go back
        </Link>
      </div>
    )
  }

  const presentCount = registrations.filter((r) => r.attendanceStatus === 'Present').length
  const absentCount = registrations.filter((r) => r.attendanceStatus === 'Absent').length

  const imageUrl = event.image
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${event.image}`
    : null

  return (
    <div className="space-y-6">
      <Link
        to="/member/my-events"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to My Events
      </Link>

      {/* Event Info */}
      <div className="card overflow-hidden">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-64 object-cover"
            crossOrigin="anonymous"
          />
        )}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">{event.title}</h1>
          <p className="text-slate-600 leading-relaxed mb-4">{event.description}</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar size={16} className="text-slate-400" />
              {new Date(event.eventDateTime).toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}{' '}
              at{' '}
              {new Date(event.eventDateTime).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin size={16} className="text-slate-400" />
              {event.location}
            </div>
            {event.committeeName && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building2 size={16} className="text-slate-400" />
                {event.committeeName}
              </div>
            )}
            {event.credits != null && event.credits > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-700 font-medium">
                <Award size={16} />
                {event.credits} {event.credits === 1 ? 'Credit' : 'Credits'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          icon={Users}
          label="Total Registered"
          value={registrations.length}
          color="primary"
        />
        <StatsCard
          icon={CheckCircle}
          label="Present"
          value={presentCount}
          color="emerald"
        />
        <StatsCard
          icon={XCircle}
          label="Absent"
          value={absentCount}
          color="rose"
        />
      </div>

      {/* Attendance Table */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Registered Students</h2>
        <AttendanceTable
          registrations={registrations}
          onMarkAttendance={handleMarkAttendance}
          loading={markingAttendance}
        />
      </div>
    </div>
  )
}
