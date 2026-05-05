import { CheckCircle, XCircle, MinusCircle } from 'lucide-react'

export default function AttendanceTable({ registrations, onMarkAttendance, loading = false }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle size={12} /> Present
          </span>
        )
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">
            <XCircle size={12} /> Absent
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            <MinusCircle size={12} /> Not Marked
          </span>
        )
    }
  }

  if (!registrations || registrations.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No students have registered for this event yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">#</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Student Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Email</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Course</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Year</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg, index) => (
            <tr key={reg._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="py-3 px-4 text-sm text-slate-600">{index + 1}</td>
              <td className="py-3 px-4 text-sm font-medium text-slate-900">
                {reg.studentId?.name || 'N/A'}
              </td>
              <td className="py-3 px-4 text-sm text-slate-600">{reg.studentId?.email || 'N/A'}</td>
              <td className="py-3 px-4 text-sm text-slate-600">{reg.studentId?.course || '-'}</td>
              <td className="py-3 px-4 text-sm text-slate-600">{reg.studentId?.year || '-'}</td>
              <td className="py-3 px-4">{getStatusBadge(reg.attendanceStatus)}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onMarkAttendance(reg._id, 'Present')}
                    disabled={loading || reg.attendanceStatus === 'Present'}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Present
                  </button>
                  <button
                    onClick={() => onMarkAttendance(reg._id, 'Absent')}
                    disabled={loading || reg.attendanceStatus === 'Absent'}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Absent
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
