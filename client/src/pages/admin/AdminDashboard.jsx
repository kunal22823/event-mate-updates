import { useState, useEffect } from 'react'
import apiClient from '../../api/client'
import StatsCard from '../../components/StatsCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Users, CalendarDays, UserCheck, BarChart3, Shield, CheckCircle, Download, TrendingUp } from 'lucide-react'
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
  const [overview, setOverview] = useState(null)
  const [committees, setCommittees] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [overviewRes, committeeRes] = await Promise.all([
          apiClient.get('/analytics/dashboard/overview'),
          apiClient.get('/analytics/committees'),
        ])
        setOverview(overviewRes.data)
        setCommittees(committeeRes.data || [])
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const handleExportAllEvents = async () => {
    try {
      setExporting(true)
      const response = await apiClient.post('/export/all-events', {}, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'all_events.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentChild.removeChild(link)
    } catch (error) {
      console.error('Failed to export events:', error)
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const committeeChart = committees.map((c) => ({
    name: c.committeeName,
    registrations: c.totalRegistrations,
    attendance: c.totalAttended,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">System-wide analytics and overview</p>
        </div>
        <button
          onClick={handleExportAllEvents}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export Events'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard icon={CalendarDays} label="Total Events" value={overview?.totalEvents || 0} color="emerald" />
        <StatsCard icon={UserCheck} label="Registrations" value={overview?.totalRegistrations || 0} color="primary" />
        <StatsCard icon={Users} label="Students" value={overview?.totalStudents || 0} color="sky" />
        <StatsCard icon={Shield} label="Members" value={overview?.totalMembers || 0} color="amber" />
        <StatsCard icon={TrendingUp} label="Attendance Rate" value={`${overview?.overallAttendanceRate || 0}%`} color="emerald" />
        <StatsCard icon={CheckCircle} label="Certificates" value={overview?.totalCertificates || 0} color="violet" />
      </div>

      {/* Top Committees */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Top Committees by Registrations</h3>
        {committeeChart.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={committeeChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend />
              <Bar dataKey="registrations" name="Registrations" fill="#3b82f6" />
              <Bar dataKey="attendance" name="Present" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Committees Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">Committee Analytics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Committee</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-900">Events</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-900">Registrations</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-900">Attendance</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-900">Credits Distributed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {committees.map((committee) => (
                <tr key={committee.committeeName} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-sm text-slate-700 font-medium">{committee.committeeName}</td>
                  <td className="px-6 py-3 text-sm text-slate-600 text-right">{committee.totalEvents}</td>
                  <td className="px-6 py-3 text-sm text-slate-600 text-right">{committee.totalRegistrations}</td>
                  <td className="px-6 py-3 text-sm text-right">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      {committee.attendanceRate}%
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600 text-right">{committee.totalCreditsDistributed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
