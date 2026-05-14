import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/client'
import StatsCard from '../../components/StatsCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { User, Mail, Shield, Calendar, Award, CheckCircle, AlertCircle } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
  })
  const [stats, setStats] = useState(null)
  const [createdEventsCount, setCreatedEventsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, eventsRes] = await Promise.all([
          apiClient.get('/registrations/stats/me'),
          apiClient.get('/events/member/mine'),
        ])
        setStats(statsRes.data)
        setCreatedEventsCount(eventsRes.data?.length || 0)
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

  const getApprovalStatusBadge = () => {
    if (user?.committeeApproved) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
          <CheckCircle size={16} />
          Approved
        </span>
      )
    } else if (user?.committeeStatus === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
          <AlertCircle size={16} />
          Rejected
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
          <Calendar size={16} />
          Pending
        </span>
      )
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">View and update your profile information</p>
      </div>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={CheckCircle}
          label="Participated Events"
          value={stats?.totalAttended || 0}
          color="emerald"
        />
        <StatsCard
          icon={Award}
          label="Total Credits"
          value={stats?.totalCredits || 0}
          color="primary"
        />
        <StatsCard
          icon={User}
          label="Created Events"
          value={createdEventsCount}
          color="sky"
        />
        <StatsCard
          icon={Shield}
          label="Attendance Rate"
          value={`${stats?.attendancePercentage || 0}%`}
          color="amber"
        />
      </div>

      {/* Profile Information Card */}
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
                  setFormData({ name: user?.name || '' })
                }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <div className="flex items-center gap-2">
                <User size={16} />
                Full Name
              </div>
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
              />
            ) : (
              <p className="text-slate-900 font-medium">{user?.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                Email Address
              </div>
            </label>
            <p className="text-slate-900 font-medium">{user?.email}</p>
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Committee Name */}
          {user?.role === 'member' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <div className="flex items-center gap-2">
                  <Shield size={16} />
                  Committee
                </div>
              </label>
              <p className="text-slate-900 font-medium">N/A</p>
              <p className="text-xs text-slate-500 mt-1">Committee assignment will be handled by administrators</p>
            </div>
          )}

          {/* Approval Status */}
          {user?.role === 'member' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  Approval Status
                </div>
              </label>
              {getApprovalStatusBadge()}
            </div>
          )}

          {/* Credits */}
          <div className="pt-4 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Total Credits Earned</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalCredits || 0}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Events Attended</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalAttended || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Card */}
      <div className="card p-6 bg-slate-50">
        <h3 className="font-semibold text-slate-900 mb-3">Additional Information</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>
            <strong>Role:</strong> {user?.role === 'member' ? 'Committee Member' : 'Student'}
          </li>
          <li>
            <strong>Registered Events:</strong> {stats?.totalRegistered || 0}
          </li>
          <li>
            <strong>Created Events:</strong> {createdEventsCount}
          </li>
          {user?.role === 'member' && (
            <li>
              <strong>Participation Status:</strong> You can participate in events as both a member and student
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
