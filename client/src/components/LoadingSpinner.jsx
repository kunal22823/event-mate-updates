import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ fullScreen = false, size = 32 }) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={size} className="animate-spin text-primary-600" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={size} className="animate-spin text-primary-600" />
    </div>
  )
}
