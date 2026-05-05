import { Routes, Route } from 'react-router-dom'
import AuthGuard from './components/AuthGuard'
import Layout from './components/Layout'

// Public pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard'
import BrowseEvents from './pages/student/BrowseEvents'
import StudentMyEvents from './pages/student/MyEvents'
import Profile from './pages/student/Profile'

// Member pages
import MemberDashboard from './pages/member/MemberDashboard'
import AddEvent from './pages/member/AddEvent'
import MemberMyEvents from './pages/member/MemberMyEvents'
import EventDetail from './pages/member/EventDetail'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageEvents from './pages/admin/ManageEvents'
import ManageMembers from './pages/admin/ManageMembers'
import ManageStudents from './pages/admin/ManageStudents'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student routes */}
      <Route element={<AuthGuard roles={['student']} />}>
        <Route element={<Layout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/events" element={<BrowseEvents />} />
          <Route path="/student/my-events" element={<StudentMyEvents />} />
          <Route path="/student/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Committee Member routes */}
      <Route element={<AuthGuard roles={['member']} />}>
        <Route element={<Layout />}>
          <Route path="/member" element={<MemberDashboard />} />
          <Route path="/member/add-event" element={<AddEvent />} />
          <Route path="/member/my-events" element={<MemberMyEvents />} />
          <Route path="/member/events/:id" element={<EventDetail />} />
        </Route>
      </Route>

      {/* Super Admin routes */}
      <Route element={<AuthGuard roles={['superadmin']} />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/events" element={<ManageEvents />} />
          <Route path="/admin/members" element={<ManageMembers />} />
          <Route path="/admin/students" element={<ManageStudents />} />
        </Route>
      </Route>
    </Routes>
  )
}
