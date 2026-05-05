import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/client'
import StatsCard from '../../components/StatsCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { User, Mail, BookOpen, GraduationCap, CalendarCheck, CheckCircle, BarChart3, Award } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    course: user?.course || '',
    year: user?.year || '',
  })
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/registrations/stats/me')
        setStats(res.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await apiClient.put('/auth/profile', formData)
      updateUser(res.data.user)
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">View and update your profile information</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(false)
                  setFormData({ name: user?.name || '', course: user?.course || '', year: user?.year || '' })
                }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary text-sm" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <User size={18} className="text-slate-400" />
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-medium">Full Name</p>
              {editing ? (
                <input
                  type="text"
                  className="input-field mt-1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <p className="text-sm text-slate-900 font-medium">{user?.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Mail size={18} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Email</p>
              <p className="text-sm text-slate-900 font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <BookOpen size={18} className="text-slate-400" />
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-medium">Course</p>
              {editing ? (
                <input
                  type="text"
                  className="input-field mt-1"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
              ) : (
                <p className="text-sm text-slate-900 font-medium">{user?.course || 'Not set'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <GraduationCap size={18} className="text-slate-400" />
            <div className="flex-1">
              <p className="text-xs text-slate-400 font-medium">Year</p>
              {editing ? (
                <select
                  className="input-field mt-1"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              ) : (
                <p className="text-sm text-slate-900 font-medium">{user?.year || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
