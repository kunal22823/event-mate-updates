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
import UnifiedDashboard from './pages/member/UnifiedDashboard'
import MemberBrowseEvents from './pages/member/BrowseEvents'
import ParticipatedEvents from './pages/member/ParticipatedEvents'
import MemberProfile from './pages/member/Profile'
import AddEvent from './pages/member/AddEvent'
import MemberMyEvents from './pages/member/MemberMyEvents'
import EventDetail from './pages/member/EventDetail'
import ExportData from './pages/member/ExportData'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageEvents from './pages/admin/ManageEvents'
import ManageMembers from './pages/admin/ManageMembers'
import ManageStudents from './pages/admin/ManageStudents'
import EventAnalytics from './pages/admin/EventAnalytics'
import StudentAnalytics from './pages/admin/StudentAnalytics'
import ApprovalManager from './pages/admin/ApprovalManager'

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
          <Route path="/member" element={<UnifiedDashboard />} />
          <Route path="/member/browse" element={<MemberBrowseEvents />} />
          <Route path="/member/participated" element={<ParticipatedEvents />} />
          <Route path="/member/profile" element={<MemberProfile />} />
          <Route path="/member/add-event" element={<AddEvent />} requireApproved={true} />
          <Route path="/member/my-events" element={<MemberMyEvents />} requireApproved={true} />
          <Route path="/member/events/:id" element={<EventDetail />} />
          <Route path="/member/export" element={<ExportData />} requireApproved={true} />
        </Route>
      </Route>

      {/* Super Admin routes */}
      <Route element={<AuthGuard roles={['superadmin']} />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/events" element={<ManageEvents />} />
          <Route path="/admin/members" element={<ManageMembers />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/approvals" element={<ApprovalManager />} />
          <Route path="/admin/analytics/events" element={<EventAnalytics />} />
          <Route path="/admin/analytics/students" element={<StudentAnalytics />} />
        </Route>
      </Route>
    </Routes>
  )
}
