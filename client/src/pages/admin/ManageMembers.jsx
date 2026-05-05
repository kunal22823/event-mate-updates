import { useState, useEffect } from 'react'
import apiClient from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { Trash2, Search, Mail } from 'lucide-react'

export default function ManageMembers() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await apiClient.get('/admin/users?role=member')
      setMembers(res.data)
    } catch (error) {
      console.error('Failed to fetch members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure? This will also delete all events and registrations created by this member.'))
      return

    setDeleting(userId)
    try {
      await apiClient.delete(`/admin/users/${userId}`)
      setMembers(members.filter((m) => m._id !== userId))
      toast.success('Member removed successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member.')
    } finally {
      setDeleting(null)
    }
  }

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Committee Members</h1>
        <p className="text-slate-500 mt-1">All committee members ({members.length})</p>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          className="input-field pl-10"
          placeholder="Search members by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredMembers.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">No committee members found.</div>
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
                {filteredMembers.map((member, index) => (
                  <tr key={member._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-600">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">{member.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        {member.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{member.course || '-'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{member.year || '-'}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(member.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(member._id)}
                        disabled={deleting === member._id}
                        className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Remove member"
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
