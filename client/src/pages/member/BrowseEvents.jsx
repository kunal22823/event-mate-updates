import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/client'
import EventCard from '../../components/EventCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { Search, AlertCircle } from 'lucide-react'

export default function BrowseEvents() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [myRegistrations, setMyRegistrations] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, regsRes] = await Promise.all([
          apiClient.get('/events'),
          apiClient.get('/registrations/my'),
        ])
        setEvents(eventsRes.data)
        setMyRegistrations(regsRes.data)
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const isRegistered = (eventId) => {
    return myRegistrations.some((r) => r.eventId?._id === eventId)
  }

  const isOwnEvent = (eventId) => {
    return events.find(e => e._id === eventId)?.createdBy === user?.id
  }

  const handleRegister = async (eventId) => {
    if (isOwnEvent(eventId)) {
      toast.error('You cannot register for your own event.')
      return
    }

    setRegistering(eventId)
    try {
      await apiClient.post(`/registrations/${eventId}`)
      const regsRes = await apiClient.get('/registrations/my')
      setMyRegistrations(regsRes.data)
      toast.success('Successfully registered for the event!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.')
    } finally {
      setRegistering(null)
    }
  }

  const filteredEvents = events
    .filter((event) => {
      if (filter === 'upcoming') return new Date(event.eventDateTime) > new Date()
      if (filter === 'past') return new Date(event.eventDateTime) <= new Date()
      return true
    })
    .filter(
      (event) =>
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase()) ||
        event.location.toLowerCase().includes(search.toLowerCase())
    )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Browse Events</h1>
        <p className="text-slate-500 mt-1">Discover and participate in college events</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-full sm:w-44"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Events</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">
          No events found matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => {
            const registered = isRegistered(event._id)
            const isOwn = isOwnEvent(event._id)
            
            return (
              <div key={event._id} className="relative">
                {isOwn && (
                  <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded z-10">
                    Your Event
                  </div>
                )}
                <EventCard
                  event={event}
                  isRegistered={registered}
                  isOwnEvent={isOwn}
                  onRegister={handleRegister}
                  registering={registering === event._id}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
