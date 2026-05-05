import { useState, useMemo } from 'react'
import { Upload, X } from 'lucide-react'

// Compute the min datetime-local value (current time, floored to the minute)
function getMinDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Convert an ISO Date string to datetime-local format (YYYY-MM-DDTHH:MM)
function toDateTimeLocal(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function EventForm({ initialData, onSubmit, loading = false, submitLabel = 'Create Event' }) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [eventDateTime, setEventDateTime] = useState(toDateTimeLocal(initialData?.eventDateTime))
  const [dateTimeError, setDateTimeError] = useState('')
  const [committeeName, setCommitteeName] = useState(initialData?.committeeName || '')
  const [registrationLink, setRegistrationLink] = useState(initialData?.registrationLink || '')
  const [credits, setCredits] = useState(initialData?.credits ?? '')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialData?.image || null)

  const minDateTime = useMemo(() => getMinDateTime(), [])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const clearImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Client-side validation: must be in the future
    const selectedDate = new Date(eventDateTime)
    if (selectedDate <= new Date()) {
      setDateTimeError('Event date and time must be in the future.')
      return
    }
    setDateTimeError('')

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('location', location)
    formData.append('eventDateTime', new Date(eventDateTime).toISOString())
    formData.append('committeeName', committeeName)
    if (registrationLink) {
      formData.append('registrationLink', registrationLink)
    }
    if (credits !== '' && credits !== null && credits !== undefined) {
      formData.append('credits', credits)
    }
    if (image) {
      formData.append('image', image)
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Title</label>
        <input
          type="text"
          className="input-field"
          placeholder="e.g., Tech Talk on AI"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
        <textarea
          className="input-field min-h-[120px] resize-y"
          placeholder="Describe the event details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g., Auditorium A"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Date & Time</label>
          <input
            type="datetime-local"
            className={`input-field ${dateTimeError ? 'border-red-400 focus:ring-red-400' : ''}`}
            value={eventDateTime}
            min={minDateTime}
            onChange={(e) => {
              setEventDateTime(e.target.value)
              if (dateTimeError) setDateTimeError('')
            }}
            required
          />
          {dateTimeError && (
            <p className="text-xs text-red-500 mt-1">{dateTimeError}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Committee Name</label>
        <input
          type="text"
          className="input-field"
          placeholder="e.g., IEEE, CSI, GDSC"
          value={committeeName}
          onChange={(e) => setCommitteeName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Registration Link <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="url"
            className="input-field"
            placeholder="https://external-registration-page.com"
            value={registrationLink}
            onChange={(e) => setRegistrationLink(e.target.value)}
          />
          <p className="text-xs text-slate-400 mt-1">
            If provided, students will be redirected to this link to register.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Credits <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="number"
            className="input-field"
            placeholder="e.g., 2"
            min="0"
            step="1"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
          />
          <p className="text-xs text-slate-400 mt-1">
            Credits awarded to students marked as Present.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Image</label>
        {imagePreview ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200">
            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-slate-900/70 text-white rounded-full hover:bg-slate-900/90 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors">
            <Upload size={32} className="text-slate-400 mb-2" />
            <span className="text-sm text-slate-500">Click to upload an image</span>
            <span className="text-xs text-slate-400 mt-1">JPEG, PNG, GIF, WebP (max 5MB)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}
