import { useAuth } from '../context/AuthContext'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

export default function ApprovalStatus() {
  const { user } = useAuth()

  if (!user || user.role !== 'member') {
    return null
  }

  if (user.committeeApproved) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
        <CheckCircle className="w-4 h-4" />
        Approved
      </div>
    )
  }

  if (user.committeeStatus === 'rejected') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
        <AlertCircle className="w-4 h-4" />
        Rejected
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
      <Clock className="w-4 h-4" />
      Pending
    </div>
  )
}
