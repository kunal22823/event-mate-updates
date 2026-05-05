import { Calendar, MapPin, User, Award, Building2 } from 'lucide-react'

export default function EventCard({ event, actionButton, showCreator = false }) {
  const eventDate = new Date(event.eventDateTime)
  const isPast = eventDate < new Date()
  const imageUrl = event.image
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${event.image}`
    : null

  return (
    <div className="card overflow-hidden flex flex-col">
      {imageUrl ? (
        <div className="h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
          <Calendar size={48} className="text-white opacity-50" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {isPast ? (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Past
            </span>
          ) : (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Upcoming
            </span>
          )}
          {event.committeeName && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-700">
              {event.committeeName}
            </span>
          )}
          {event.credits != null && event.credits > 0 && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {event.credits} {event.credits === 1 ? 'Credit' : 'Credits'}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-lg text-slate-900 mb-2 text-pretty">{event.title}</h3>

        <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar size={14} className="text-slate-400" />
            <span>
              {eventDate.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}{' '}
              at{' '}
              {eventDate.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={14} className="text-slate-400" />
            <span>{event.location}</span>
          </div>
          {showCreator && event.createdBy && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User size={14} className="text-slate-400" />
              <span>{event.createdBy.name}</span>
            </div>
          )}
        </div>

        {actionButton && <div className="mt-auto">{actionButton}</div>}
      </div>
    </div>
  )
}
