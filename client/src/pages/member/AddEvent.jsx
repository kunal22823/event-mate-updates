import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../api/client'
import EventForm from '../../components/EventForm'
import toast from 'react-hot-toast'

export default function AddEvent() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      await apiClient.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Event created successfully! Email notifications sent to all students.')
      navigate('/member/my-events')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Add New Event</h1>
        <p className="text-slate-500 mt-1">Create a new event. All students will be notified via email.</p>
      </div>

      <div className="card p-6">
        <EventForm onSubmit={handleSubmit} loading={loading} submitLabel="Create Event" />
      </div>
    </div>
  )
}
