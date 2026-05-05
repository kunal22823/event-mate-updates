import { useState, useEffect } from 'react'
import apiClient from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { Trash2, Search, Mail } from 'lucide-react'

export default function ManageStudents() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await apiClient.get('/admin/users?role=student')
      setStudents(res.data)
    } catch (error) {
      console.error('Failed to fetch students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure? This will also delete all of this student\'s registrations.')) return

    setDeleting(userId)
    try {
      await apiClient.delete(`/admin/users/${userId}`)
      setStudents(students.filter((s) => s._id !== userId))
      toast.success('Student removed successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove student.')
    } finally {
      setDeleting(null)
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.course || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Students</h1>
        <p className="text-slate-500 mt-1">All registered students ({students.length})</p>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          className="input-field pl-10"
          placeholder="Search students by name, email, or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">No students found.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">#</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Course</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Year</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={student._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-600">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">{student.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        {student.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{student.course || '-'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{student.year || '-'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(student.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(student._id)}
                        disabled={deleting === student._id}
                        className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Remove student"
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
