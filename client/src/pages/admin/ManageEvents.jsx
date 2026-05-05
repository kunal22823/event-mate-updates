import { useState, useEffect } from 'react'
import apiClient from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { Trash2, Calendar, MapPin, Search } from 'lucide-react'

export default function ManageEvents() {
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await apiClient.get('/events')
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
      await apiClient.delete(`/admin/events/${eventId}`)
      setEvents(events.filter((e) => e._id !== eventId))
      toast.success('Event deleted successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event.')
    } finally {
      setDeleting(null)
    }
  }

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      (e.createdBy?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Events</h1>
        <p className="text-slate-500 mt-1">All events in the system ({events.length})</p>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          className="input-field pl-10"
          placeholder="Search events by title, location, or creator..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredEvents.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">No events found.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">#</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Title</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Created By</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event, index) => (
                  <tr key={event._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-600">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">{event.title}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{event.createdBy?.name || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(event.eventDateTime).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        {event.location}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(event._id)}
                        disabled={deleting === event._id}
                        className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete event"
                      >
                        <Trash2 size={16} />
                      </button>
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
