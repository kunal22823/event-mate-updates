import { useState, useEffect } from 'react'
import apiClient from '../../api/client'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

export default function ApprovalManager() {
  const [pendingUsers, setPendingUsers] = useState([])
  const [approvedUsers, setApprovedUsers] = useState([])
  const [rejectedUsers, setRejectedUsers] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    fetchApprovals()
  }, [])

  const fetchApprovals = async () => {
    try {
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        apiClient.get('/approvals/pending'),
        apiClient.get('/approvals/approved'),
        apiClient.get('/approvals/rejected'),
      ])
      setPendingUsers(pendingRes.data || [])
      setApprovedUsers(approvedRes.data || [])
      setRejectedUsers(rejectedRes.data || [])
    } catch (error) {
      console.error('Failed to fetch approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId, remainingCredits = 0) => {
    try {
      setProcessingId(userId)
      await apiClient.patch(`/approvals/${userId}/approve`, {
        remainingCredits,
      })
      setPendingUsers(pendingUsers.filter((u) => u._id !== userId))
      await fetchApprovals()
    } catch (error) {
      console.error('Failed to approve user:', error)
      alert('Failed to approve user')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (userId) => {
    try {
      setProcessingId(userId)
      await apiClient.patch(`/approvals/${userId}/reject`, {})
      setPendingUsers(pendingUsers.filter((u) => u._id !== userId))
      await fetchApprovals()
    } catch (error) {
      console.error('Failed to reject user:', error)
      alert('Failed to reject user')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) return <LoadingSpinner />

  const renderUserTable = (users, showActions = true) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Name</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Email</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Course</th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Year</th>
            {showActions && <th className="text-center px-6 py-3 text-sm font-semibold text-slate-900">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-slate-500 text-sm">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.course || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{user.year || '-'}</td>
                {showActions && activeTab === 'pending' && (
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleApprove(user._id, 0)}
                        disabled={processingId === user._id}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm transition-colors"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user._id)}
                        disabled={processingId === user._id}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm transition-colors"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Committee Member Approvals</h1>
        <p className="text-slate-500 mt-1">Manage and approve committee member requests</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-slate-200">
        {[
          { id: 'pending', label: 'Pending', icon: Clock, count: pendingUsers.length },
          { id: 'approved', label: 'Approved', icon: CheckCircle, count: approvedUsers.length },
          { id: 'rejected', label: 'Rejected', icon: XCircle, count: rejectedUsers.length },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={18} />
              {tab.label}
              <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="card p-6">
        {activeTab === 'pending' && renderUserTable(pendingUsers, true)}
        {activeTab === 'approved' && renderUserTable(approvedUsers, false)}
        {activeTab === 'rejected' && renderUserTable(rejectedUsers, false)}
      </div>

      {/* Info Box */}
      <div className="card p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
        <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
        <div>
          <h3 className="font-semibold text-blue-900">How Approvals Work</h3>
          <p className="text-blue-800 text-sm mt-1">
            Committee members must be approved by admins before they can create events or register for events. When
            approving, you can set their initial remaining credits limit.
          </p>
        </div>
      </div>
    </div>
  )
}
