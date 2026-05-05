import { useState, useEffect } from 'react'
import apiClient from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Users, TrendingUp, Award, BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export default function StudentAnalytics() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterYear, setFilterYear] = useState('')
  const [filterCourse, setFilterCourse] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/analytics/students')
      setStudents(res.data || [])
    } catch (error) {
      console.error('Failed to fetch student analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  // Filter students
  const filteredStudents = students.filter((student) => {
    if (filterYear && student.year !== filterYear) return false
    if (filterCourse && student.course !== filterCourse) return false
    return true
  })

  // Get unique years and courses
  const years = [...new Set(students.map((s) => s.year).filter(Boolean))]
  const courses = [...new Set(students.map((s) => s.course).filter(Boolean))]

  // Stats summary
  const totalStudents = filteredStudents.length
  const totalRegistrations = filteredStudents.reduce((sum, s) => sum + s.totalRegistrations, 0)
  const totalAttended = filteredStudents.reduce((sum, s) => sum + s.totalAttended, 0)
  const avgAttendanceRate =
    totalAttended > 0 ? Math.round((totalAttended / totalRegistrations) * 100) : 0
  const totalCredits = filteredStudents.reduce((sum, s) => sum + s.totalCredits, 0)

  // Top performers
  const topPerformers = [...filteredStudents]
    .sort((a, b) => b.attendanceRate - a.attendanceRate)
    .slice(0, 10)

  const performerChartData = topPerformers.map((s) => ({
    name: s.name.split(' ')[0],
    attendance: s.attendanceRate,
    registrations: s.totalRegistrations,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Analytics</h1>
        <p className="text-slate-500 mt-1">Comprehensive student participation metrics</p>
      </div>

      {/* Filters */}
      <div className="card p-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Year</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Course</label>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-blue-900">{totalStudents}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 mb-1">Total Registrations</p>
              <p className="text-3xl font-bold text-green-900">{totalRegistrations}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 mb-1">Avg Attendance Rate</p>
              <p className="text-3xl font-bold text-purple-900">{avgAttendanceRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600 opacity-50" />
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-700 mb-1">Total Credits Earned</p>
              <p className="text-3xl font-bold text-amber-900">{totalCredits}</p>
            </div>
            <Award className="w-8 h-8 text-amber-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Top Performers Chart */}
      {performerChartData.length > 0 && (
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Top 10 Performers by Attendance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performerChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                }}
              />
              <Legend />
              <Bar dataKey="attendance" name="Attendance Rate (%)" fill="#10b981" />
              <Bar dataKey="registrations" name="Total Registrations" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Students Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">Student Details ({filteredStudents.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Name</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Email</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Course</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Year</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-900">Registrations</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-900">Attended</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-900">Attendance Rate</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-900">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-sm text-slate-700 font-medium">{student.name}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{student.email}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{student.course || '—'}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{student.year || '—'}</td>
                  <td className="px-6 py-3 text-sm text-slate-600 text-right">{student.totalRegistrations}</td>
                  <td className="px-6 py-3 text-sm text-slate-600 text-right">{student.totalAttended}</td>
                  <td className="px-6 py-3 text-sm text-right">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {student.attendanceRate}%
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600 text-right font-semibold">{student.totalCredits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
