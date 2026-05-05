import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../../api/client'
import StatsCard from '../../components/StatsCard'
import EventCard from '../../components/EventCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CalendarCheck, CheckCircle, BarChart3, CalendarDays, Award } from 'lucide-react'

export default function StudentDashboard() {
  const [stats, setStats] = useState(null)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          apiClient.get('/registrations/stats/me'),
          apiClient.get('/events'),
        ])
        setStats(statsRes.data)

        const upcoming = eventsRes.data
          .filter((e) => new Date(e.eventDateTime) > new Date())
          .slice(0, 4)
        setUpcomingEvents(upcoming)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
        <p className="text-slate-500 mt-1">Track your event participation and registrations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          icon={CalendarCheck}
          label="Registered Events"
          value={stats?.totalRegistered || 0}
          color="primary"
        />
        <StatsCard
          icon={CheckCircle}
          label="Events Attended"
          value={stats?.totalAttended || 0}
          color="emerald"
        />
        <StatsCard
          icon={BarChart3}
          label="Attendance %"
          value={`${stats?.attendancePercentage || 0}%`}
          color="amber"
        />
        <StatsCard
          icon={Award}
          label="Total Credits"
          value={stats?.totalCredits || 0}
          color="sky"
        />
        <StatsCard
          icon={CalendarDays}
          label="Upcoming Events"
          value={stats?.upcomingCount || 0}
          color="rose"
        />
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Events</h2>
          <Link to="/student/events" className="text-sm text-primary-600 font-medium hover:underline">
            Browse All Events
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">
            No upcoming events at the moment. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} showCreator />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
