import { useState, useEffect } from 'react'
import apiClient from '../../api/client'
import StatsCard from '../../components/StatsCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Users, CalendarDays, UserCheck, BarChart3, Shield, CheckCircle } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
const PIE_COLORS = ['#10b981', '#ef4444', '#94a3b8']

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get('/admin/analytics')
        setAnalytics(res.data)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return <LoadingSpinner />

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const formatMonthLabel = (monthStr) => {
    if (!monthStr) return ''
    const [year, month] = monthStr.split('-')
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`
  }

  const eventsByMonth = (analytics?.eventsByMonth || []).map((d) => ({
    ...d,
    label: formatMonthLabel(d.month),
  }))

  const registrationsByMonth = (analytics?.registrationsByMonth || []).map((d) => ({
    ...d,
    label: formatMonthLabel(d.month),
  }))

  const attendanceBreakdown = (analytics?.attendanceBreakdown || []).map((d, i) => ({
    ...d,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">System-wide analytics and overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard icon={Users} label="Total Users" value={analytics?.totalUsers || 0} color="primary" />
        <StatsCard icon={Users} label="Students" value={analytics?.totalStudents || 0} color="sky" />
        <StatsCard icon={Shield} label="Members" value={analytics?.totalMembers || 0} color="amber" />
        <StatsCard icon={CalendarDays} label="Total Events" value={analytics?.totalEvents || 0} color="emerald" />
        <StatsCard icon={UserCheck} label="Registrations" value={analytics?.totalRegistrations || 0} color="primary" />
        <StatsCard icon={CheckCircle} label="Attendance Rate" value={`${analytics?.attendanceRate || 0}%`} color="emerald" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Month */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Events Created (Last 6 Months)</h3>
          {eventsByMonth.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={eventsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="count" name="Events" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Registrations by Month */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Registrations Trend (Last 6 Months)</h3>
          {registrationsByMonth.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={registrationsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Registrations"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Attendance Breakdown */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Attendance Breakdown</h3>
        {attendanceBreakdown.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No data available</div>
        ) : (
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="status"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {attendanceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
