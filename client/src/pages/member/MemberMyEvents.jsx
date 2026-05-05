import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import EventCard from '../../components/EventCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { PlusCircle, Trash2, Eye, Users } from 'lucide-react'

export default function MemberMyEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

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

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? All registrations will be removed.')) return

    setDeleting(eventId)
    try {
      await apiClient.delete(`/events/${eventId}`)
      setEvents(events.filter((e) => e._id !== eventId))
      toast.success('Event deleted successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event.')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Events</h1>
          <p className="text-slate-500 mt-1">Events you have created ({events.length})</p>
        </div>
        <Link to="/member/add-event" className="btn-primary flex items-center gap-2">
          <PlusCircle size={18} />
          Add Event
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              actionButton={
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Users size={14} />
                    <span>{event.registrationCount || 0} registered</span>
                    <span className="text-slate-300">|</span>
                    <span>{event.attendedCount || 0} attended</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/member/events/${event._id}`}
                      className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-sm"
                    >
                      <Eye size={14} /> View
                    </Link>
                    <button
                      onClick={() => handleDelete(event._id)}
                      disabled={deleting === event._id}
                      className="btn-danger flex items-center justify-center gap-1.5 text-sm px-3"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
